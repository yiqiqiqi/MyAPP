'use strict';

exports.main = async (event, context) => {
	const { userId, photos, description, petName, petType } = event

	try {
		if (!userId || !photos || photos.length === 0) {
			return {
				code: -1,
				msg: '参数错误'
			}
		}

		const db = uniCloud.database()
		const photosCollection = db.collection('photos')

		// 批量插入照片记录
		const photoRecords = photos.map(photo => ({
			userId: userId,
			fileID: photo.fileID,
			url: photo.url,
			description: description || '',
			petName: petName || '',
			petType: petType || '',
			createTime: Date.now()
		}))

		const res = await photosCollection.add(photoRecords)

		return {
			code: 0,
			msg: '上传成功',
			data: {
				ids: res.ids
			}
		}
	} catch (error) {
		console.error('上传失败', error)
		return {
			code: -1,
			msg: '上传失败：' + error.message
		}
	}
}
