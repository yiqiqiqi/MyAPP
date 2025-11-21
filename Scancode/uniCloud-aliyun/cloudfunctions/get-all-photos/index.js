'use strict';

exports.main = async (event, context) => {
	const { page = 1, pageSize = 10 } = event

	try {
		const db = uniCloud.database()
		const photosCollection = db.collection('photos')
		const usersCollection = db.collection('users')

		// 计算分页参数
		const skip = (page - 1) * pageSize

		// 获取照片列表，按时间倒序
		const photosRes = await photosCollection
			.orderBy('createTime', 'desc')
			.skip(skip)
			.limit(pageSize)
			.get()

		// 获取所有相关用户信息
		const userIds = [...new Set(photosRes.data.map(photo => photo.userId))]
		const usersRes = await usersCollection
			.where({
				_id: db.command.in(userIds)
			})
			.get()

		// 创建用户信息映射
		const userMap = {}
		usersRes.data.forEach(user => {
			userMap[user._id] = {
				nickName: user.nickName,
				avatarUrl: user.avatarUrl
			}
		})

		// 组合照片和用户信息
		const photos = photosRes.data.map(photo => ({
			...photo,
			userName: userMap[photo.userId]?.nickName || '未知用户',
			userAvatar: userMap[photo.userId]?.avatarUrl || ''
		}))

		return {
			code: 0,
			msg: '获取成功',
			data: {
				photos: photos
			}
		}
	} catch (error) {
		console.error('获取照片失败', error)
		return {
			code: -1,
			msg: '获取失败：' + error.message
		}
	}
}
