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
		const photosCollection = db.collection('photos')

		// 查询用户的所有照片，按时间倒序
		const res = await photosCollection
			.where({
				userId: userId
			})
			.orderBy('createTime', 'desc')
			.get()

		return {
			code: 0,
			msg: '获取成功',
			data: {
				photos: res.data
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
