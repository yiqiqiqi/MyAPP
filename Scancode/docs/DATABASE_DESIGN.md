# 数据库设计文档

## 📊 数据库表结构

### 1. users (用户表)

用户的核心信息表，使用微信 openid 作为唯一标识。

```javascript
{
  _id: String,              // MongoDB 自动生成的文档ID
  openid: String,           // 微信 openid（唯一标识）⭐ 索引字段
  sessionKey: String,       // 微信 session_key（用于解密数据）
  nickName: String,         // 用户昵称
  avatarUrl: String,        // 用户头像URL
  createTime: Number,       // 创建时间（时间戳）
  lastLoginTime: Number     // 最后登录时间（时间戳）
}
```

**索引建议**:
- `openid`: 唯一索引，用于快速查询用户

**字段说明**:
- `openid`: 微信用户的唯一标识，同一用户在同一小程序中 openid 固定
- `sessionKey`: 用于解密微信敏感数据（如手机号），需定期更新
- 时间字段使用时间戳格式，便于排序和计算

---

### 2. photos (照片表)

用户上传的照片信息表。

```javascript
{
  _id: String,              // MongoDB 自动生成的文档ID
  userId: String,           // 用户ID（关联 users._id）⭐ 索引字段
  fileID: String,           // 云存储文件ID
  url: String,              // 照片访问URL
  description: String,      // 照片描述
  petName: String,          // 宠物名称（可选）
  petType: String,          // 宠物类型（可选）
  likeCount: Number,        // 点赞数（默认 0）
  commentCount: Number,     // 评论数（默认 0）
  createTime: Number        // 创建时间（时间戳）⭐ 索引字段
}
```

**索引建议**:
- `userId`: 普通索引，用于查询用户的所有照片
- `createTime`: 降序索引，用于按时间排序
- 复合索引 `{ userId: 1, createTime: -1 }`: 优化用户照片时间排序查询

**字段说明**:
- `userId`: 关联用户表，标识照片所属用户
- `fileID`: 云存储中的文件标识，用于删除文件
- `url`: 照片的访问链接，用于前端展示
- `likeCount` 和 `commentCount`: 冗余字段，提升查询性能

---

### 3. likes (点赞表)

用户点赞记录表。

```javascript
{
  _id: String,              // MongoDB 自动生成的文档ID
  userId: String,           // 点赞用户ID ⭐ 索引字段
  photoId: String,          // 照片ID ⭐ 索引字段
  createTime: Number        // 点赞时间（时间戳）
}
```

**索引建议**:
- 唯一复合索引 `{ userId: 1, photoId: 1 }`: 防止重复点赞，快速查询点赞状态
- `photoId`: 普通索引，用于查询照片的所有点赞

**业务逻辑**:
- 点赞时：插入记录 + photos.likeCount += 1
- 取消点赞：删除记录 + photos.likeCount -= 1
- 查询点赞状态：根据 userId 和 photoId 查询

---

### 4. comments (评论表)

照片评论表。

```javascript
{
  _id: String,              // MongoDB 自动生成的文档ID
  userId: String,           // 评论用户ID ⭐ 索引字段
  photoId: String,          // 照片ID ⭐ 索引字段
  content: String,          // 评论内容
  userName: String,         // 评论者昵称（冗余字段）
  userAvatar: String,       // 评论者头像（冗余字段）
  createTime: Number        // 评论时间（时间戳）⭐ 索引字段
}
```

**索引建议**:
- 复合索引 `{ photoId: 1, createTime: -1 }`: 按时间查询照片评论
- `userId`: 普通索引，用于查询用户的所有评论

**字段说明**:
- `userName` 和 `userAvatar`: 冗余字段，避免每次查询评论都要关联用户表
- `content`: 评论内容，建议限制长度（如 500 字符）

---

## 🔐 数据安全

### 权限设计

**users 表**:
- ✅ 用户可以读取自己的完整信息
- ✅ 用户可以更新自己的 nickName 和 avatarUrl
- ❌ openid 和 sessionKey 对前端不可见
- ❌ 不允许直接删除用户

**photos 表**:
- ✅ 所有人可以读取照片列表（公开）
- ✅ 用户可以上传照片（关联到自己的 userId）
- ✅ 用户只能删除自己的照片
- ❌ 不允许修改 likeCount 和 commentCount（通过云函数维护）

**likes 表**:
- ✅ 用户可以查询自己的点赞记录
- ✅ 用户可以点赞/取消点赞（通过云函数）
- ❌ 不允许直接操作点赞表

**comments 表**:
- ✅ 所有人可以读取评论
- ✅ 用户可以发表评论
- ✅ 用户只能删除自己的评论
- ❌ 不允许修改别人的评论

---

## 📈 性能优化建议

### 1. 索引优化
```javascript
// 创建索引（在数据库管理后台执行）
db.users.createIndex({ openid: 1 }, { unique: true })
db.photos.createIndex({ userId: 1, createTime: -1 })
db.likes.createIndex({ userId: 1, photoId: 1 }, { unique: true })
db.comments.createIndex({ photoId: 1, createTime: -1 })
```

### 2. 数据冗余
- ✅ 在 photos 表中保存 likeCount 和 commentCount，避免每次都统计
- ✅ 在 comments 表中保存 userName 和 userAvatar，减少关联查询

### 3. 分页查询
- ✅ 所有列表查询都使用分页（skip + limit）
- ✅ 默认每页 10-20 条数据
- ✅ 使用 createTime 索引优化排序

### 4. 缓存策略
- 建议在前端缓存用户信息（localStorage）
- 建议在前端缓存照片列表（30秒过期）
- 点赞状态使用乐观更新 + 后台同步

---

## 🔄 数据迁移

如果需要从旧的 deviceId 方案迁移到 openid 方案：

```javascript
// 迁移脚本（云函数）
const db = uniCloud.database()

// 1. 为旧用户添加临时标识
await db.collection('users').where({
  openid: db.command.exists(false)
}).update({
  needsMigration: true
})

// 2. 用户下次登录时，更新 openid
// 在 user-login 云函数中处理
```

---

## 📝 数据字典

### 用户状态
- `active`: 正常
- `banned`: 已封禁
- `deleted`: 已删除（软删除）

### 照片状态
- `normal`: 正常
- `hidden`: 隐藏
- `deleted`: 已删除

### 评论状态
- `normal`: 正常
- `hidden`: 被隐藏
- `deleted`: 已删除

---

## 🛠️ 维护工具

建议创建以下云函数进行数据维护：

1. **数据统计**: 统计用户数、照片数、评论数等
2. **数据清理**: 清理过期的 sessionKey
3. **数据修复**: 修复不一致的 likeCount 和 commentCount
4. **数据备份**: 定期导出重要数据

---

更新时间：2024-11-21
版本：v1.0
