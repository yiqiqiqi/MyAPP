'use strict';

exports.main = async (event, context) => {
	const { userId, photoId, content } = event

	try {
		if (!userId || !photoId || !content) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		if (content.trim().length === 0) {
			return {
				code: -1,
				msg: '评论内容不能为空'
			}
		}

		const db = uniCloud.database()
		const dbCmd = db.command
		const commentsCollection = db.collection('comments')
		const photosCollection = db.collection('photos')
		const usersCollection = db.collection('users')

		// 获取用户信息
		const userRes = await usersCollection.doc(userId).get()
		if (userRes.data.length === 0) {
			return {
				code: -1,
				msg: '用户不存在'
			}
		}

		const user = userRes.data[0]

		// 添加评论
		const commentRes = await commentsCollection.add({
			userId: userId,
			photoId: photoId,
			content: content.trim(),
			userName: user.nickName || '未知用户',
			userAvatar: user.avatarUrl || '',
			createTime: Date.now()
		})

		// 更新照片的评论数（加1）
		await photosCollection.doc(photoId).update({
			commentCount: dbCmd.inc(1)
		})

		return {
			code: 0,
			msg: '评论成功',
			data: {
				commentId: commentRes.id
			}
		}
	} catch (error) {
		console.error('评论失败', error)
		return {
			code: -1,
			msg: '评论失败：' + error.message
		}
	}
}
