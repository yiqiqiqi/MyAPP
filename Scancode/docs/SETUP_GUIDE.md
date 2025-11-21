# 📖 微信小程序登录配置和测试指南

## 🎯 概述

本指南将帮助你完成微信小程序登录功能的配置和测试。

---

## ⚙️ 配置步骤

### 步骤 1: 获取微信小程序 AppSecret

#### 1.1 登录微信公众平台
访问：https://mp.weixin.qq.com
使用管理员微信扫码登录

#### 1.2 进入开发设置
- 点击左侧菜单：**开发** → **开发管理** → **开发设置**

#### 1.3 查看开发者ID
在"开发者ID"区域可以看到：
- **AppID (小程序ID)**：`wx066d994bc428956c` ✅（已在 manifest.json 中配置）
- **AppSecret (小程序密钥)**：需要生成或查看

#### 1.4 生成/查看 AppSecret
- 点击 AppSecret 旁边的**"生成"**或**"重置"**按钮
- **⚠️ 重要**：AppSecret 只会显示一次，请立即复制保存
- 如果不慎丢失，需要重置（会导致旧的失效）

#### 1.5 记录 AppSecret
AppSecret 是一串 **32 位的字符串**，类似：
```
abcdef1234567890abcdef1234567890
```

---

### 步骤 2: 配置到云函数

#### 2.1 打开云函数文件
找到文件：`uniCloud-aliyun/cloudfunctions/user-login/index.js`

#### 2.2 修改第 18 行
找到：
```javascript
const SECRET = 'YOUR_APP_SECRET_HERE'  // ⚠️ 需要配置
```

替换为你的 AppSecret：
```javascript
const SECRET = 'abcdef1234567890abcdef1234567890'  // 替换为实际的 AppSecret
```

#### 2.3 保存文件

---

### 步骤 3: 上传云函数

#### 3.1 使用 HBuilderX 上传
1. 打开 HBuilderX
2. 找到 `uniCloud-aliyun/cloudfunctions/user-login` 目录
3. 右键点击 → **上传云函数**
4. 等待上传完成

#### 3.2 或使用命令行
```bash
# 安装 uniCloud CLI（如果未安装）
npm install -g @dcloudio/unicloud-cli

# 登录
unicloud login

# 上传云函数
unicloud upload user-login
```

---

## 🧪 测试登录功能

### 测试 1: 首次登录

#### 预期流程
1. 打开小程序
2. 看到"欢迎使用宠物相册"卡片
3. 点击"微信登录"按钮
4. 弹出授权窗口，显示：
   - 头像
   - 昵称
   - 获取你的公开信息（昵称、头像等）
5. 点击"允许"
6. 看到 Loading 提示"登录中..."
7. 提示"登录成功 ✨"
8. 页面刷新，显示用户信息卡片

#### 可能的错误

**错误 1: "请先配置微信小程序的AppSecret"**
- 原因：未配置 AppSecret
- 解决：按照步骤 2 配置 AppSecret 并重新上传云函数

**错误 2: "微信接口错误：invalid appid"**
- 原因：AppID 不正确
- 解决：检查 manifest.json 中的 appid 是否正确

**错误 3: "微信接口错误：invalid appsecret"**
- 原因：AppSecret 配置错误
- 解决：重新在微信公众平台查看 AppSecret 并重新配置

**错误 4: "微信接口错误：invalid code"**
- 原因：code 已过期或已使用
- 解决：重新登录（code 5分钟内有效且只能使用一次）

---

### 测试 2: 再次登录

#### 测试步骤
1. 完全关闭小程序（从任务列表中划掉）
2. 重新打开小程序
3. 应该自动显示用户信息（无需再次登录）

#### 预期结果
- ✅ 自动加载用户信息
- ✅ 显示用户头像和昵称
- ✅ 显示已上传的照片数量

---

### 测试 3: 上传照片

#### 测试步骤
1. 确保已登录
2. 点击"快速上传"区域的"+"按钮
3. 选择照片（最多9张）
4. 输入描述
5. 点击"发布"按钮

#### 预期结果
- ✅ 显示上传进度
- ✅ 提示"发布成功！"
- ✅ 照片出现在"我的照片"列表中
- ✅ 照片数量更新

---

### 测试 4: 社区互动

#### 测试点赞
1. 切换到"宠物圈"tab
2. 看到其他用户的照片
3. 点击"🤍"按钮
4. 应该变成"❤️"并显示点赞数

#### 测试评论
1. 点击"💬"按钮
2. 弹出评论弹窗
3. 输入评论内容
4. 点击"发送"
5. 评论出现在列表中

#### 可能的问题

**问题：点赞/评论提示"请先登录"**
- 原因：用户未登录或登录状态丢失
- 解决：重新登录

---

### 测试 5: 跨设备同步

#### 测试步骤
1. 在设备 A 上登录并上传照片
2. 在设备 B 上用**同一个微信号**登录
3. 应该看到设备 A 上传的照片

#### 预期结果
- ✅ 设备 B 可以看到设备 A 的照片
- ✅ 用户数据完全同步
- ✅ openid 在两个设备上相同

---

## 🔍 调试技巧

### 1. 查看云函数日志

#### HBuilderX 方式
1. 打开 HBuilderX
2. 点击菜单：**运行** → **运行到云端** → **云函数日志**
3. 筛选 `user-login` 云函数
4. 查看执行日志

#### uniCloud Web控制台
1. 访问：https://unicloud.dcloud.net.cn
2. 选择对应的服务空间
3. 云函数 → 函数列表 → user-login → 日志

### 2. 查看小程序控制台

#### 开发工具
1. 打开微信开发者工具
2. 点击"调试器"tab
3. 查看 Console 输出
4. 查看 Network 请求

#### 真机调试
1. 开启真机调试模式
2. 打开 vConsole
3. 查看日志输出

---

## 📊 数据验证

### 验证用户数据

登录成功后，检查本地存储：

```javascript
// 在控制台执行
console.log('用户信息:', uni.getStorageSync('userInfo'))
console.log('用户ID:', uni.getStorageSync('userId'))
console.log('openid:', uni.getStorageSync('openid'))
```

应该看到：
```javascript
{
  userInfo: { nickName: "xxx", avatarUrl: "https://..." }
  userId: "abc123..."
  openid: "o6_bmjrPTlm6_2sgVt7hMZOPfL2M"
}
```

### 验证云数据库

在 uniCloud Web控制台：
1. 数据库 → 云数据库 → users 表
2. 应该看到新创建的用户记录
3. 包含字段：openid, nickName, avatarUrl, createTime 等

---

## ⚠️ 安全提示

### 1. 保护 AppSecret
- ❌ 不要将 AppSecret 提交到 GitHub 等公开仓库
- ✅ 使用环境变量或配置中心
- ✅ 在 .gitignore 中添加配置文件

### 2. 生产环境建议
- 使用 uniCloud 配置中心存储密钥
- 定期更新 AppSecret
- 监控异常登录

---

## 📞 需要帮助？

### 常见问题
详见：`uniCloud-aliyun/cloudfunctions/user-login/README.md`

### 数据库设计
详见：`docs/DATABASE_DESIGN.md`

### 微信官方文档
- [小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [code2Session](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)

---

更新时间：2024-11-21
版本：v1.0
