'use strict';

exports.main = async (event, context) => {
	const { code, userInfo } = event

	try {
		if (!code || !userInfo) {
			return {
				code: -1,
				msg: '参数错误：code和用户信息不能为空'
			}
		}

		// 微信小程序配置
		// ⚠️ 重要：请在微信公众平台获取 AppSecret 并填写在这里
		// 获取方式：登录 https://mp.weixin.qq.com -> 开发 -> 开发管理 -> 开发设置 -> AppSecret
		const APPID = 'wx066d994bc428956c'  // 从 manifest.json 中获取
		const SECRET = 'YOUR_APP_SECRET_HERE'  // ⚠️ 需要配置

		// 检查是否配置了 AppSecret
		if (SECRET === 'YOUR_APP_SECRET_HERE') {
			return {
				code: -1,
				msg: '请先配置微信小程序的AppSecret'
			}
		}

		// 调用微信接口获取 openid
		const wxLoginUrl = 'https://api.weixin.qq.com/sns/jscode2session'
		const wxRes = await uniCloud.httpclient.request(wxLoginUrl, {
			method: 'GET',
			data: {
				appid: APPID,
				secret: SECRET,
				js_code: code,
				grant_type: 'authorization_code'
			},
			dataType: 'json'
		})

		console.log('微信登录响应：', wxRes)

		// 检查微信API返回
		if (wxRes.status !== 200 || !wxRes.data) {
			return {
				code: -1,
				msg: '调用微信接口失败'
			}
		}

		if (wxRes.data.errcode) {
			return {
				code: -1,
				msg: `微信接口错误：${wxRes.data.errmsg || '未知错误'}`,
				errcode: wxRes.data.errcode
			}
		}

		const openid = wxRes.data.openid
		const sessionKey = wxRes.data.session_key

		if (!openid) {
			return {
				code: -1,
				msg: '获取openid失败'
			}
		}

		// 获取数据库引用
		const db = uniCloud.database()
		const usersCollection = db.collection('users')

		// 使用 openid 作为唯一标识查询用户
		const userRes = await usersCollection.where({
			openid: openid
		}).get()

		let userId
		let userData

		if (userRes.data.length === 0) {
			// 新用户，创建记录
			const addRes = await usersCollection.add({
				openid: openid,
				sessionKey: sessionKey,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				createTime: Date.now(),
				lastLoginTime: Date.now()
			})
			userId = addRes.id
			userData = {
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl
			}
		} else {
			// 老用户，更新信息
			userId = userRes.data[0]._id
			await usersCollection.doc(userId).update({
				sessionKey: sessionKey,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				lastLoginTime: Date.now()
			})
			userData = {
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl
			}
		}

		return {
			code: 0,
			msg: '登录成功',
			data: {
				userId: userId,
				openid: openid,
				userInfo: userData
			}
		}
	} catch (error) {
		console.error('登录失败：', error)
		return {
			code: -1,
			msg: '登录失败：' + error.message,
			error: error.toString()
		}
	}
}
