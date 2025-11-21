# 微信小程序登录配置说明

## ⚠️ 重要：必须配置 AppSecret

本云函数需要配置微信小程序的 AppSecret 才能正常工作。

## 📝 获取 AppSecret 步骤

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用管理员微信扫码登录

2. **进入开发设置**
   - 点击左侧菜单：**开发** → **开发管理** → **开发设置**

3. **获取 AppSecret**
   - 找到"开发者ID"区域
   - 查看 **AppID (小程序ID)**：应该是 `wx066d994bc428956c`
   - 点击 **AppSecret (小程序密钥)** 旁边的"生成"或"查看"按钮
   - **⚠️ 注意**：AppSecret 只会显示一次，请务必复制保存

4. **配置到云函数**
   - 打开文件：`uniCloud-aliyun/cloudfunctions/user-login/index.js`
   - 找到第 18 行：`const SECRET = 'YOUR_APP_SECRET_HERE'`
   - 替换为你的 AppSecret：`const SECRET = '你的AppSecret'`

## 🔒 安全提示

- ❌ **不要**将 AppSecret 提交到公开的代码仓库
- ✅ **建议**：使用环境变量或配置中心存储密钥
- ✅ **建议**：在 .gitignore 中忽略包含密钥的文件

## ✅ 配置示例

```javascript
// 正确示例
const APPID = 'wx066d994bc428956c'
const SECRET = 'abcdef1234567890abcdef1234567890'  // 32位字符串

// 错误示例（不要这样做）
const SECRET = 'YOUR_APP_SECRET_HERE'  // ❌ 未配置
const SECRET = ''  // ❌ 空字符串
```

## 🧪 测试登录

配置完成后：

1. 重新上传云函数到 uniCloud
2. 在小程序中点击"微信登录"
3. 授权用户信息
4. 应该看到"登录成功 ✨"提示

## ❓ 常见问题

### Q: 提示"请先配置微信小程序的AppSecret"
A: 说明还未配置 AppSecret，请按照上述步骤配置

### Q: 提示"微信接口错误：invalid code"
A: code 已过期或已使用，请重新登录

### Q: 提示"微信接口错误：invalid appid"
A: AppID 配置错误，请检查 manifest.json 和云函数中的 AppID 是否一致

### Q: 如何在多个环境使用不同配置？
A: 建议使用 uniCloud 的配置中心功能，或根据环境变量动态加载配置

## 📚 相关文档

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [uniCloud 云函数文档](https://uniapp.dcloud.net.cn/uniCloud/cf-functions.html)
