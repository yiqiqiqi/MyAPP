'use strict';

exports.main = async (event, context) => {
	const { userId, photoIds } = event

	try {
		if (!userId || !photoIds || !Array.isArray(photoIds)) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		const db = uniCloud.database()
		const dbCmd = db.command
		const likesCollection = db.collection('likes')

		// 查询用户对这些照片的点赞状态
		const res = await likesCollection
			.where({
				userId: userId,
				photoId: dbCmd.in(photoIds)
			})
			.get()

		// 构建点赞状态映射表
		const likedPhotoIds = res.data.map(item => item.photoId)

		return {
			code: 0,
			msg: '获取成功',
			data: {
				likedPhotoIds: likedPhotoIds
			}
		}
	} catch (error) {
		console.error('获取点赞状态失败', error)
		return {
			code: -1,
			msg: '获取失败：' + error.message
		}
	}
}
