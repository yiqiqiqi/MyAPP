'use strict';

/**
 * 用户信息管理云函数
 * 支持查询和更新用户信息
 */
exports.main = async (event, context) => {
	const { action, userId, data } = event

	try {
		const db = uniCloud.database()
		const usersCollection = db.collection('users')

		switch (action) {
			case 'get':
				// 获取用户信息
				return await getUserProfile(usersCollection, userId)

			case 'update':
				// 更新用户信息
				return await updateUserProfile(usersCollection, userId, data)

			case 'stats':
				// 获取用户统计信息
				return await getUserStats(db, userId)

			default:
				return {
					code: -1,
					msg: '未知的操作类型'
				}
		}
	} catch (error) {
		console.error('用户信息操作失败：', error)
		return {
			code: -1,
			msg: '操作失败：' + error.message
		}
	}
}

/**
 * 获取用户信息
 */
async function getUserProfile(usersCollection, userId) {
	if (!userId) {
		return {
			code: -1,
			msg: '用户ID不能为空'
		}
	}

	const userRes = await usersCollection.doc(userId).get()

	if (userRes.data.length === 0) {
		return {
			code: -1,
			msg: '用户不存在'
		}
	}

	const user = userRes.data[0]

	// 返回用户信息（隐藏敏感字段）
	return {
		code: 0,
		msg: '获取成功',
		data: {
			userId: user._id,
			nickName: user.nickName,
			avatarUrl: user.avatarUrl,
			createTime: user.createTime,
			lastLoginTime: user.lastLoginTime
		}
	}
}

/**
 * 更新用户信息
 */
async function updateUserProfile(usersCollection, userId, data) {
	if (!userId) {
		return {
			code: -1,
			msg: '用户ID不能为空'
		}
	}

	if (!data || Object.keys(data).length === 0) {
		return {
			code: -1,
			msg: '更新数据不能为空'
		}
	}

	// 只允许更新特定字段
	const allowedFields = ['nickName', 'avatarUrl']
	const updateData = {}

	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			updateData[field] = data[field]
		}
	}

	if (Object.keys(updateData).length === 0) {
		return {
			code: -1,
			msg: '没有可更新的字段'
		}
	}

	// 添加更新时间
	updateData.updateTime = Date.now()

	const updateRes = await usersCollection.doc(userId).update(updateData)

	if (updateRes.updated === 0) {
		return {
			code: -1,
			msg: '用户不存在或更新失败'
		}
	}

	return {
		code: 0,
		msg: '更新成功',
		data: updateData
	}
}

/**
 * 获取用户统计信息
 */
async function getUserStats(db, userId) {
	if (!userId) {
		return {
			code: -1,
			msg: '用户ID不能为空'
		}
	}

	// 并行查询统计数据
	const [photosCount, likesCount, commentsCount] = await Promise.all([
		// 统计照片数
		db.collection('photos').where({ userId }).count(),

		// 统计点赞数
		db.collection('likes').where({ userId }).count(),

		// 统计评论数
		db.collection('comments').where({ userId }).count()
	])

	// 统计获得的总点赞数（其他人给我的点赞）
	const photosRes = await db.collection('photos')
		.where({ userId })
		.field({ _id: true })
		.get()

	const photoIds = photosRes.data.map(p => p._id)

	let receivedLikesCount = 0
	if (photoIds.length > 0) {
		const receivedLikesRes = await db.collection('likes')
			.where({
				photoId: db.command.in(photoIds)
			})
			.count()
		receivedLikesCount = receivedLikesRes.total
	}

	return {
		code: 0,
		msg: '获取成功',
		data: {
			photosCount: photosCount.total || 0,         // 我上传的照片数
			likesGiven: likesCount.total || 0,           // 我给出的点赞数
			likesReceived: receivedLikesCount,           // 我收到的点赞数
			commentsCount: commentsCount.total || 0      // 我发表的评论数
		}
	}
}
