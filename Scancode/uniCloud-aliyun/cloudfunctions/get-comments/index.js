'use strict';

exports.main = async (event, context) => {
	const { photoId, page = 1, pageSize = 20 } = event

	try {
		if (!photoId) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		const db = uniCloud.database()
		const commentsCollection = db.collection('comments')

		// 计算分页参数
		const skip = (page - 1) * pageSize
		const limit = pageSize

		// 查询评论，按时间倒序
		const res = await commentsCollection
			.where({
				photoId: photoId
			})
			.orderBy('createTime', 'desc')
			.skip(skip)
			.limit(limit)
			.get()

		// 获取总数
		const countRes = await commentsCollection
			.where({
				photoId: photoId
			})
			.count()

		return {
			code: 0,
			msg: '获取成功',
			data: {
				comments: res.data,
				total: countRes.total,
				page: page,
				pageSize: pageSize,
				hasMore: skip + res.data.length < countRes.total
			}
		}
	} catch (error) {
		console.error('获取评论失败', error)
		return {
			code: -1,
			msg: '获取失败：' + error.message
		}
	}
}
