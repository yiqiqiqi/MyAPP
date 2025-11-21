<template>
	<view class="community-page">
		<!-- 波浪装饰 -->
		<view class="wave-decoration">
			<view class="wave wave1"></view>
			<view class="wave wave2"></view>
		</view>

		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<text class="navbar-title">🌟 宠物圈</text>
			</view>
		</view>

		<scroll-view
			class="content"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<!-- 顶部提示 -->
			<view class="tip-banner">
				<text class="tip-icon">💝</text>
				<text class="tip-text">发现大家分享的萌宠瞬间</text>
			</view>

				<!-- 骨架屏加载 -->
			<view class="photo-feed" v-if="loading && photos.length === 0">
				<view class="feed-item skeleton-card" v-for="n in 3" :key="'skeleton-' + n">
					<view class="item-header">
						<view class="skeleton-avatar skeleton-animation"></view>
						<view class="skeleton-info">
							<view class="skeleton-line skeleton-animation" style="width: 120rpx; height: 30rpx;"></view>
							<view class="skeleton-line skeleton-animation" style="width: 80rpx; height: 24rpx; margin-top: 10rpx;"></view>
						</view>
					</view>
					<view class="skeleton-photo skeleton-animation"></view>
					<view class="skeleton-actions">
						<view class="skeleton-line skeleton-animation" style="width: 60rpx; height: 30rpx;"></view>
						<view class="skeleton-line skeleton-animation" style="width: 60rpx; height: 30rpx;"></view>
						<view class="skeleton-line skeleton-animation" style="width: 60rpx; height: 30rpx;"></view>
					</view>
				</view>
			</view>

			<!-- 照片流 -->
			<view class="photo-feed" v-if="photos.length > 0">
				<view
					class="feed-item fade-in-scale"
					v-for="(photo, index) in photos"
					:key="photo._id"
				>
					<!-- 用户信息 -->
					<view class="item-header" @tap="viewUserAlbum(photo.userId)">
						<view class="user-avatar-wrapper">
							<image class="user-avatar" :src="photo.userAvatar" mode="aspectFill"></image>
							<view class="avatar-ring"></view>
						</view>
						<view class="user-info">
							<text class="user-name">{{ photo.userName }}</text>
							<text class="post-time">{{ formatTime(photo.createTime) }}</text>
						</view>
						<view class="follow-btn">
							<text>+关注</text>
						</view>
					</view>

					<!-- 照片描述 -->
					<view class="item-desc" v-if="photo.description">
						<text>{{ photo.description }}</text>
					</view>

					<!-- 照片 -->
					<view class="item-photo" @tap="previewPhoto(index)">
						<image class="photo-img" :src="photo.url" mode="widthFix" lazy-load></image>
						<view class="photo-badge">
							<text class="badge-icon">🐾</text>
						</view>
					</view>

					<!-- 互动区 -->
					<view class="item-actions">
						<view class="action-item" @tap="toggleLike(index)">
							<text class="action-icon">{{ photo.isLiked ? '❤️' : '🤍' }}</text>
							<text class="action-text">{{ photo.likeCount || '赞' }}</text>
						</view>
						<view class="action-item" @tap="showComments(index)">
							<text class="action-icon">💬</text>
							<text class="action-text">{{ photo.commentCount || '评论' }}</text>
						</view>
						<view class="action-item" @tap="sharePhoto(photo)">
							<text class="action-icon">📤</text>
							<text class="action-text">分享</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore && photos.length > 0">
				<view class="loading-spinner" v-if="loading"></view>
				<text class="load-text">{{ loading ? '加载中...' : '上拉加载更多' }}</text>
			</view>

			<!-- 没有更多了 -->
			<view class="no-more" v-if="!hasMore && photos.length > 0">
				<text class="no-more-text">🌸 没有更多了 🌸</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && photos.length === 0">
				<text class="empty-icon pulse">🎨</text>
				<text class="empty-text">还没有人分享照片</text>
				<text class="empty-hint">成为第一个分享萌宠的人吧~</text>
				<button class="go-upload-btn" @tap="goToUpload">
					<text>📸 立即分享</text>
				</button>
			</view>

			<!-- 加载中 -->
			<view class="loading-state" v-if="loading && photos.length === 0">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 底部间距 -->
			<view class="bottom-space"></view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			photos: [],
			loading: false,
			refreshing: false,
			page: 1,
			pageSize: 10,
			hasMore: true
		}
	},
	onLoad() {
		this.loadPhotos()
	},
	methods: {
		// 加载照片列表
		async loadPhotos(isRefresh = false) {
			if (this.loading) return

			this.loading = true

			try {
				const res = await uniCloud.callFunction({
					name: 'get-all-photos',
					data: {
						page: isRefresh ? 1 : this.page,
						pageSize: this.pageSize
					}
				})

				if (res.result.code === 0) {
					const newPhotos = res.result.data.photos.map(photo => ({
						...photo,
						isLiked: false,
						likeCount: photo.likeCount || 0,
						commentCount: photo.commentCount || 0
					}))

					if (isRefresh) {
						this.photos = newPhotos
						this.page = 1
					} else {
						this.photos.push(...newPhotos)
					}

					this.hasMore = newPhotos.length === this.pageSize
				}
			} catch (error) {
				console.error('加载失败', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},

		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			this.page = 1
			await this.loadPhotos(true)
			this.refreshing = false
		},

		// 加载更多
		loadMore() {
			if (!this.hasMore || this.loading) return

			this.page++
			this.loadPhotos()
		},

		// 预览照片
		previewPhoto(index) {
			const urls = this.photos.map(p => p.url)
			uni.previewImage({
				urls,
				current: index
			})
		},

		// 查看用户相册
		viewUserAlbum(userId) {
			uni.navigateTo({
				url: `/pages/album/index?userId=${userId}`
			})
		},

		// 点赞
		toggleLike(index) {
			const photo = this.photos[index]
			if (!photo.isLiked) {
				photo.isLiked = true
				photo.likeCount = (photo.likeCount || 0) + 1
				uni.showToast({
					title: '❤️',
					icon: 'none',
					duration: 500
				})
			} else {
				photo.isLiked = false
				photo.likeCount = Math.max((photo.likeCount || 1) - 1, 0)
			}
			this.$forceUpdate()
		},

		// 显示评论
		showComments(index) {
			uni.showToast({
				title: '评论功能开发中',
				icon: 'none'
			})
		},

		// 分享照片
		sharePhoto(photo) {
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})

			uni.showToast({
				title: '点击右上角分享',
				icon: 'none'
			})
		},

		// 跳转上传
		goToUpload() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		},

		// 格式化时间
		formatTime(timestamp) {
			const now = Date.now()
			const diff = now - timestamp

			const minute = 60 * 1000
			const hour = 60 * minute
			const day = 24 * hour

			if (diff < minute) {
				return '刚刚'
			} else if (diff < hour) {
				return `${Math.floor(diff / minute)}分钟前`
			} else if (diff < day) {
				return `${Math.floor(diff / hour)}小时前`
			} else if (diff < 7 * day) {
				return `${Math.floor(diff / day)}天前`
			} else {
				const date = new Date(timestamp)
				const month = date.getMonth() + 1
				const day = date.getDate()
				return `${month}月${day}日`
			}
		}
	},

	// 分享配置
	onShareAppMessage() {
		return {
			title: '🐾 宠物圈 - 分享萌宠瞬间',
			path: '/pages/community/index'
		}
	},

	onShareTimeline() {
		return {
			title: '🐾 宠物圈 - 分享萌宠瞬间',
			query: ''
		}
	}
}
</script>

<style lang="scss">
.community-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 50%, #FFF5F7 100%);
	position: relative;
}

/* 波浪装饰 */
.wave-decoration {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 250rpx;
	z-index: 0;
	pointer-events: none;

	.wave {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 200%;
		height: 100%;
		background: linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 105, 180, 0.3) 100%);
		border-radius: 0 0 50% 50%;
		animation: wave-animation 8s ease-in-out infinite;
	}

	.wave1 {
		animation-delay: 0s;
		opacity: 0.4;
	}

	.wave2 {
		animation-delay: -4s;
		opacity: 0.3;
	}
}

@keyframes wave-animation {
	0%, 100% {
		transform: translateX(-50%) translateY(0);
	}
	50% {
		transform: translateX(-50%) translateY(-30rpx);
	}
}

/* 导航栏 */
.custom-navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
	padding-top: calc(var(--status-bar-height) + 10rpx);
	padding-bottom: 20rpx;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.3);

	.navbar-content {
		padding: 0 30rpx;

		.navbar-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #FFFFFF;
			text-shadow: 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.1);
		}
	}
}

.content {
	position: relative;
	z-index: 1;
	padding-top: calc(var(--status-bar-height) + 100rpx);
	height: 100vh;
	box-sizing: border-box;
	padding-left: 30rpx;
	padding-right: 30rpx;
}

/* 提示横幅 */
.tip-banner {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 25rpx;
	margin-bottom: 30rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

	.tip-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.tip-text {
		font-size: 28rpx;
		color: #FF69B4;
		font-weight: 600;
	}
}

/* 骨架屏 */
.skeleton-card {
	.item-header {
		display: flex;
		align-items: center;
		padding: 25rpx;

		.skeleton-avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background: #F5F5F5;
			margin-right: 20rpx;
		}

		.skeleton-info {
			flex: 1;
		}
	}

	.skeleton-photo {
		width: 100%;
		height: 500rpx;
		background: #F5F5F5;
	}

	.skeleton-actions {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 25rpx;
	}
}

.skeleton-line {
	background: #F5F5F5;
	border-radius: 5rpx;
}

.skeleton-animation {
	animation: skeleton-loading 1.5s ease-in-out infinite;
	background: linear-gradient(90deg, #F5F5F5 25%, #E8E8E8 50%, #F5F5F5 75%);
	background-size: 200% 100%;
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

/* 照片流 */
.photo-feed {
	.feed-item {
		margin-bottom: 30rpx;
		background: #FFFFFF;
		border-radius: 30rpx;
		overflow: hidden;
		box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.15);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
		}

		.item-header {
			display: flex;
			align-items: center;
			padding: 25rpx 25rpx 20rpx;

			.user-avatar-wrapper {
				position: relative;
				margin-right: 20rpx;

				.user-avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					border: 4rpx solid #FFB6C1;
				}

				.avatar-ring {
					position: absolute;
					top: -6rpx;
					left: -6rpx;
					right: -6rpx;
					bottom: -6rpx;
					border-radius: 50%;
					border: 2rpx solid rgba(255, 182, 193, 0.3);
					animation: avatar-pulse 2s ease-in-out infinite;
				}
			}

			.user-info {
				flex: 1;
				display: flex;
				flex-direction: column;

				.user-name {
					font-size: 30rpx;
					font-weight: 700;
					color: #FF69B4;
					margin-bottom: 6rpx;
				}

				.post-time {
					font-size: 22rpx;
					color: #999;
				}
			}

			.follow-btn {
				padding: 10rpx 25rpx;
				background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
				color: #FFFFFF;
				font-size: 24rpx;
				font-weight: 600;
				border-radius: 30rpx;
				box-shadow: 0 4rpx 12rpx rgba(255, 105, 180, 0.3);

				&:active {
					opacity: 0.8;
				}
			}
		}

		.item-desc {
			padding: 0 25rpx 20rpx;
			font-size: 28rpx;
			color: #333;
			line-height: 1.6;
		}

		.item-photo {
			position: relative;
			width: 100%;

			.photo-img {
				width: 100%;
				display: block;
			}

			.photo-badge {
				position: absolute;
				top: 15rpx;
				right: 15rpx;
				width: 60rpx;
				height: 60rpx;
				background: rgba(255, 255, 255, 0.9);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				backdrop-filter: blur(10rpx);
				box-shadow: 0 4rpx 12rpx rgba(255, 105, 180, 0.2);

				.badge-icon {
					font-size: 32rpx;
					animation: badge-float 3s ease-in-out infinite;
				}
			}
		}

		.item-actions {
			display: flex;
			padding: 20rpx 25rpx;
			border-top: 1rpx solid #F5F5F5;

			.action-item {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				padding: 10rpx;
				border-radius: 20rpx;
				transition: all 0.3s ease;

				.action-icon {
					font-size: 32rpx;
					transition: transform 0.3s ease;
				}

				.action-text {
					font-size: 26rpx;
					color: #666;
					font-weight: 600;
				}

				&:active {
					background: rgba(255, 182, 193, 0.1);

					.action-icon {
						transform: scale(1.2);
					}
				}
			}
		}
	}
}

@keyframes avatar-pulse {
	0%, 100% {
		transform: scale(1);
		opacity: 0.3;
	}
	50% {
		transform: scale(1.08);
		opacity: 0.1;
	}
}

@keyframes badge-float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-5rpx);
	}
}

/* 淡入缩放动画 */
.fade-in-scale {
	animation: fade-in-scale 0.5s ease-out;
}

@keyframes fade-in-scale {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* 加载更多 */
.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;

	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid rgba(255, 182, 193, 0.3);
		border-top-color: #FF69B4;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 15rpx;
	}

	.load-text {
		font-size: 26rpx;
		color: #999;
	}
}

.no-more {
	padding: 40rpx 0;
	text-align: center;

	.no-more-text {
		font-size: 26rpx;
		color: #FFB6C1;
	}
}

/* 空状态 */
.empty-state {
	padding: 150rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.empty-icon {
		font-size: 140rpx;
		margin-bottom: 30rpx;
	}

	.pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	.empty-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #FF69B4;
		margin-bottom: 12rpx;
	}

	.empty-hint {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 50rpx;
	}

	.go-upload-btn {
		width: 400rpx;
		height: 85rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 45rpx;
		font-size: 30rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.4);
	}
}

/* 加载中 */
.loading-state {
	padding: 150rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.loading-spinner {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid rgba(255, 182, 193, 0.3);
		border-top-color: #FF69B4;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 30rpx;
	}

	.loading-text {
		font-size: 28rpx;
		color: #999;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

.bottom-space {
	height: 60rpx;
}
</style>
