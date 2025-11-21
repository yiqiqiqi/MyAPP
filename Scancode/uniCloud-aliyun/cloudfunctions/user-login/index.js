'use strict';

exports.main = async (event, context) => {
	const { deviceId, userInfo } = event

	try {
		if (!deviceId || !userInfo) {
			return {
				code: -1,
				msg: '参数错误：设备ID和用户信息不能为空'
			}
		}

		// 获取数据库引用
		const db = uniCloud.database()
		const usersCollection = db.collection('users')

		// 使用设备ID作为唯一标识
		// 这样可以保证同一设备的用户数据一致性
		const userRes = await usersCollection.where({
			deviceId: deviceId
		}).get()

		let userId
		let userData

		if (userRes.data.length === 0) {
			// 新用户，创建记录
			const addRes = await usersCollection.add({
				deviceId: deviceId,
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
			// 老用户，更新最后登录时间和用户信息
			userId = userRes.data[0]._id
			await usersCollection.doc(userId).update({
				lastLoginTime: Date.now(),
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl
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
				userInfo: userData
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
