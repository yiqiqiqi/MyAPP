'use strict';

exports.main = async (event, context) => {
	const { userId } = event

	try {
		if (!userId) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		const db = uniCloud.database()
		const usersCollection = db.collection('users')
		const photosCollection = db.collection('photos')

		// 获取用户信息
		const userRes = await usersCollection.doc(userId).get()

		if (userRes.data.length === 0) {
			return {
				code: -1,
				msg: '用户不存在'
			}
		}

		const userInfo = userRes.data[0]

		// 获取用户的照片
		const photosRes = await photosCollection
			.where({
				userId: userId
			})
			.orderBy('createTime', 'desc')
			.get()

		return {
			code: 0,
			msg: '获取成功',
			data: {
				userInfo: {
					nickName: userInfo.nickName,
					avatarUrl: userInfo.avatarUrl
				},
				photos: photosRes.data
			}
		}
	} catch (error) {
		console.error('获取相册失败', error)
		return {
			code: -1,
			msg: '获取失败：' + error.message
		}
	}
}
