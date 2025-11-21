'use strict';

exports.main = async (event, context) => {
	const { userId, photoId } = event

	try {
		if (!userId || !photoId) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		const db = uniCloud.database()
		const dbCmd = db.command
		const likesCollection = db.collection('likes')
		const photosCollection = db.collection('photos')

		// 检查是否已经点赞
		const existingLike = await likesCollection
			.where({
				userId: userId,
				photoId: photoId
			})
			.get()

		let isLiked = false
		let likeCount = 0

		if (existingLike.data.length > 0) {
			// 已点赞，执行取消点赞
			await likesCollection.doc(existingLike.data[0]._id).remove()

			// 更新照片的点赞数（减1）
			await photosCollection.doc(photoId).update({
				likeCount: dbCmd.inc(-1)
			})

			isLiked = false
		} else {
			// 未点赞，执行点赞
			await likesCollection.add({
				userId: userId,
				photoId: photoId,
				createTime: Date.now()
			})

			// 更新照片的点赞数（加1）
			await photosCollection.doc(photoId).update({
				likeCount: dbCmd.inc(1)
			})

			isLiked = true
		}

		// 获取更新后的照片信息
		const photoRes = await photosCollection.doc(photoId).get()
		if (photoRes.data.length > 0) {
			likeCount = photoRes.data[0].likeCount || 0
		}

		return {
			code: 0,
			msg: isLiked ? '点赞成功' : '取消点赞成功',
			data: {
				isLiked: isLiked,
				likeCount: likeCount
			}
		}
	} catch (error) {
		console.error('点赞操作失败', error)
		return {
			code: -1,
			msg: '操作失败：' + error.message
		}
	}
}
