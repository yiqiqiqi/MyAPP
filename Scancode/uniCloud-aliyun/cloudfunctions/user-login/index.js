'use strict';

exports.main = async (event, context) => {
	const { code, userInfo } = event

	try {
		// 获取数据库引用
		const db = uniCloud.database()
		const usersCollection = db.collection('users')

		// 通过code获取openid
		const res = await uniCloud.getWXContext()
		const openid = res.OPENID

		if (!openid) {
			return {
				code: -1,
				msg: '获取openid失败'
			}
		}

		// 查询用户是否存在
		const userRes = await usersCollection.where({
			openid: openid
		}).get()

		let userId

		if (userRes.data.length === 0) {
			// 新用户，创建记录
			const addRes = await usersCollection.add({
				openid: openid,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl,
				create_date: Date.now(),
				last_login_date: Date.now()
			})
			userId = addRes.id
		} else {
			// 老用户，更新最后登录时间
			userId = userRes.data[0]._id
			await usersCollection.doc(userId).update({
				last_login_date: Date.now(),
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl
			})
		}

		return {
			code: 0,
			msg: '登录成功',
			data: {
				userId: userId,
				userInfo: {
					nickName: userInfo.nickName,
					avatarUrl: userInfo.avatarUrl
				}
			}
		}
	} catch (error) {
		console.error('登录失败', error)
		return {
			code: -1,
			msg: '登录失败：' + error.message
		}
	}
}
