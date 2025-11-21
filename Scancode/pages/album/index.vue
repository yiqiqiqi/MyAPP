<template>
	<view class="album-view">
		<!-- 顶部装饰波浪 -->
		<view class="top-wave">
			<view class="wave"></view>
		</view>

		<scroll-view
			class="content"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 用户信息卡片 -->
			<view class="user-card fade-in" v-if="albumOwner">
				<view class="card-deco">
					<view class="deco-circle circle1"></view>
					<view class="deco-circle circle2"></view>
				</view>
				<view class="user-header">
					<view class="user-avatar-wrapper">
						<image class="user-avatar" :src="albumOwner.avatarUrl" mode="aspectFill"></image>
						<view class="avatar-ring"></view>
						<view class="avatar-badge">✨</view>
					</view>
					<view class="user-info">
						<text class="user-name">{{ albumOwner.nickName }}</text>
						<view class="user-stats">
							<text class="stat-item">📷 {{ photos.length }} 张照片</text>
						</view>
					</view>
				</view>
				<view class="album-banner">
					<text class="banner-icon">🐾</text>
					<text class="banner-text">{{ albumOwner.nickName }} 的萌宠相册</text>
				</view>
			</view>

			<!-- 加载中 -->
			<view class="loading-card" v-if="loading && !albumOwner">
				<view class="loading-animation">
					<view class="loading-spinner"></view>
				</view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 照片列表 -->
			<view class="photos-section" v-if="photos.length > 0">
				<view class="section-tag">
					<text class="tag-icon">🌟</text>
					<text class="tag-text">精彩瞬间</text>
				</view>

				<!-- 瀑布流布局 -->
				<view class="photo-waterfall">
					<view
						class="photo-item scale-up"
						v-for="(photo, index) in photos"
						:key="photo._id"
						@tap="previewPhoto(index)"
					>
						<view class="photo-container">
							<image
								class="photo-img"
								:src="photo.url"
								mode="widthFix"
								@load="onImageLoad"
							></image>
							<view class="photo-overlay">
								<view class="overlay-gradient"></view>
							</view>
						</view>
						<view class="photo-info-card" v-if="photo.description || photo.petName">
							<view class="info-header" v-if="photo.petName">
								<text class="pet-badge">{{ photo.petType || '🐾' }}</text>
								<text class="pet-name">{{ photo.petName }}</text>
							</view>
							<text class="photo-desc" v-if="photo.description">
								{{ photo.description }}
							</text>
							<view class="info-footer">
								<text class="photo-date">📅 {{ formatDate(photo.createTime) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state fade-in" v-if="!loading && photos.length === 0">
				<view class="empty-animation">
					<text class="empty-icon pulse">📭</text>
				</view>
				<text class="empty-title">还没有照片哦</text>
				<text class="empty-hint">TA 还没有上传照片呢~</text>
				<button class="empty-action-btn" @tap="goToMyAlbum">
					<text>✨ 创建我的相册</text>
				</button>
			</view>

			<!-- 底部装饰 -->
			<view class="bottom-deco">
				<view class="deco-divider">
					<text class="divider-icon">🌸</text>
					<view class="divider-line"></view>
					<text class="divider-icon">🐾</text>
					<view class="divider-line"></view>
					<text class="divider-icon">🌸</text>
				</view>
				<text class="deco-brand">喵汪兔星河 · 记录萌宠时光</text>
				<text class="deco-slogan">每一张照片都是珍贵的回忆</text>
			</view>

			<!-- 底部间距 -->
			<view class="bottom-space"></view>
		</scroll-view>

		<!-- 浮动按钮 -->
		<view class="float-action">
			<button class="action-btn" @tap="goToMyAlbum">
				<text class="btn-icon">🎨</text>
				<text class="btn-text">我也要建立相册</text>
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userId: '',
			albumOwner: null,
			photos: [],
			loading: true,
			refreshing: false
		}
	},
	onLoad(options) {
		if (options.userId) {
			this.userId = options.userId
			this.loadAlbum()
		} else {
			uni.showModal({
				title: '提示',
				content: '参数错误，无法加载相册',
				showCancel: false,
				confirmColor: '#FF69B4',
				success: () => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}
			})
		}
	},
	onShareAppMessage() {
		return {
			title: `🐾 ${this.albumOwner?.nickName || 'Ta'}的萌宠相册`,
			path: `/pages/album/index?userId=${this.userId}`,
			imageUrl: this.photos[0]?.url || ''
		}
	},
	onShareTimeline() {
		return {
			title: `🐾 ${this.albumOwner?.nickName || 'Ta'}的萌宠相册`,
			query: `userId=${this.userId}`,
			imageUrl: this.photos[0]?.url || ''
		}
	},
	methods: {
		// 加载相册
		async loadAlbum() {
			this.loading = true
			try {
				const res = await uniCloud.callFunction({
					name: 'get-user-album',
					data: { userId: this.userId }
				})

				if (res.result.code === 0) {
					this.albumOwner = res.result.data.userInfo
					this.photos = res.result.data.photos

					// 如果没有照片，给个提示
					if (this.photos.length === 0) {
						uni.showToast({
							title: 'TA还没有上传照片',
							icon: 'none',
							duration: 2000
						})
					}
				} else {
					throw new Error(res.result.msg || '加载失败')
				}
			} catch (error) {
				console.error('加载相册失败', error)
				uni.showModal({
					title: '加载失败',
					content: error.message || '请稍后重试',
					showCancel: false,
					confirmColor: '#FF69B4'
				})
			} finally {
				this.loading = false
			}
		},

		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			await this.loadAlbum()
			this.refreshing = false
		},

		// 预览照片
		previewPhoto(index) {
			const urls = this.photos.map(p => p.url)
			uni.previewImage({
				urls,
				current: index
			})
		},

		// 图片加载完成
		onImageLoad(e) {
			// 可以在这里做瀑布流布局的计算
		},

		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp)
			const year = date.getFullYear()
			const month = date.getMonth() + 1
			const day = date.getDate()
			return `${year}.${month}.${day}`
		},

		// 跳转到我的相册
		goToMyAlbum() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	}
}
</script>

<style lang="scss">
.album-view {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 50%, #FFF5F7 100%);
	position: relative;
	overflow: hidden;
}

/* 顶部波浪 */
.top-wave {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 200rpx;
	z-index: 0;
	pointer-events: none;

	.wave {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 200%;
		height: 100%;
		background: linear-gradient(135deg, rgba(255, 182, 193, 0.2) 0%, rgba(255, 105, 180, 0.2) 100%);
		border-radius: 0 0 50% 50%;
		animation: wave-float 10s ease-in-out infinite;
	}
}

@keyframes wave-float {
	0%, 100% {
		transform: translateX(-50%) translateY(0);
	}
	50% {
		transform: translateX(-50%) translateY(-20rpx);
	}
}

.content {
	position: relative;
	z-index: 1;
	height: 100vh;
	padding: 30rpx;
	box-sizing: border-box;
}

/* 用户卡片 */
.user-card {
	position: relative;
	padding: 50rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 15rpx 50rpx rgba(255, 105, 180, 0.25);
	margin-bottom: 30rpx;
	overflow: hidden;

	.card-deco {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;

		.deco-circle {
			position: absolute;
			border-radius: 50%;
			opacity: 0.06;
		}

		.circle1 {
			width: 200rpx;
			height: 200rpx;
			background: #FFB6C1;
			top: -60rpx;
			right: -60rpx;
		}

		.circle2 {
			width: 150rpx;
			height: 150rpx;
			background: #FF69B4;
			bottom: -40rpx;
			left: -40rpx;
		}
	}

	.user-header {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		margin-bottom: 35rpx;

		.user-avatar-wrapper {
			position: relative;
			margin-right: 30rpx;

			.user-avatar {
				width: 130rpx;
				height: 130rpx;
				border-radius: 50%;
				border: 6rpx solid #FFB6C1;
				box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.3);
			}

			.avatar-ring {
				position: absolute;
				top: -8rpx;
				left: -8rpx;
				right: -8rpx;
				bottom: -8rpx;
				border-radius: 50%;
				border: 3rpx solid rgba(255, 182, 193, 0.3);
				animation: pulse-ring 2s ease-in-out infinite;
			}

			.avatar-badge {
				position: absolute;
				bottom: 0;
				right: 0;
				font-size: 45rpx;
				filter: drop-shadow(2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1));
			}
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 40rpx;
				font-weight: 700;
				color: #FF69B4;
				margin-bottom: 15rpx;
			}

			.user-stats {
				display: flex;
				gap: 30rpx;

				.stat-item {
					font-size: 26rpx;
					color: #999;
					font-weight: 500;
				}
			}
		}
	}

	.album-banner {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 25rpx;
		background: linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(255, 105, 180, 0.2));
		border-radius: 25rpx;
		backdrop-filter: blur(10rpx);

		.banner-icon {
			font-size: 36rpx;
			margin-right: 15rpx;
		}

		.banner-text {
			font-size: 30rpx;
			color: #FF69B4;
			font-weight: 700;
		}
	}
}

@keyframes pulse-ring {
	0%, 100% {
		transform: scale(1);
		opacity: 0.3;
	}
	50% {
		transform: scale(1.1);
		opacity: 0.1;
	}
}

/* 加载中 */
.loading-card {
	padding: 120rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);
	display: flex;
	flex-direction: column;
	align-items: center;

	.loading-animation {
		margin-bottom: 30rpx;

		.loading-spinner {
			width: 80rpx;
			height: 80rpx;
			border: 6rpx solid rgba(255, 182, 193, 0.3);
			border-top-color: #FF69B4;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}
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

/* 照片区域 */
.photos-section {
	margin-bottom: 30rpx;

	.section-tag {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		padding: 20rpx 30rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
		border-radius: 25rpx;
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

		.tag-icon {
			font-size: 36rpx;
			margin-right: 15rpx;
		}

		.tag-text {
			font-size: 30rpx;
			font-weight: 700;
			color: #FF69B4;
		}
	}

	.photo-waterfall {
		column-count: 2;
		column-gap: 20rpx;

		.photo-item {
			break-inside: avoid;
			margin-bottom: 20rpx;

			.photo-container {
				position: relative;
				background: #FFFFFF;
				border-radius: 25rpx;
				overflow: hidden;
				box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.2);
				transition: all 0.3s;

				&:active {
					transform: scale(0.98);
				}

				.photo-img {
					width: 100%;
					display: block;
				}

				.photo-overlay {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 60%;
					pointer-events: none;

					.overlay-gradient {
						width: 100%;
						height: 100%;
						background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
					}
				}
			}

			.photo-info-card {
				margin-top: 10rpx;
				padding: 20rpx;
				background: #FFFFFF;
				border-radius: 20rpx;
				box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.15);

				.info-header {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;

					.pet-badge {
						font-size: 28rpx;
						margin-right: 10rpx;
					}

					.pet-name {
						font-size: 26rpx;
						color: #FF69B4;
						font-weight: 700;
					}
				}

				.photo-desc {
					display: block;
					font-size: 26rpx;
					color: #666;
					line-height: 1.6;
					margin-bottom: 12rpx;
				}

				.info-footer {
					display: flex;
					align-items: center;
					justify-content: space-between;

					.photo-date {
						font-size: 22rpx;
						color: #999;
					}
				}
			}
		}
	}
}

/* 空状态 */
.empty-state {
	padding: 120rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx;

	.empty-animation {
		margin-bottom: 35rpx;

		.empty-icon {
			font-size: 140rpx;
			display: inline-block;
		}

		.pulse {
			animation: pulse 2s ease-in-out infinite;
		}
	}

	.empty-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #FF69B4;
		margin-bottom: 15rpx;
	}

	.empty-hint {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 50rpx;
	}

	.empty-action-btn {
		width: 450rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 45rpx;
		font-size: 30rpx;
		font-weight: 700;
		box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.4);
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

/* 动画 */
.fade-in {
	animation: fade-in 0.6s ease-out;
}

@keyframes fade-in {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.scale-up {
	animation: scale-up 0.5s ease-out;
}

@keyframes scale-up {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

/* 底部装饰 */
.bottom-deco {
	padding: 50rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.deco-divider {
		display: flex;
		align-items: center;
		width: 100%;
		margin-bottom: 25rpx;

		.divider-icon {
			font-size: 32rpx;
			opacity: 0.6;
		}

		.divider-line {
			flex: 1;
			height: 2rpx;
			background: linear-gradient(to right, transparent, #FFB6C1, transparent);
			margin: 0 20rpx;
		}
	}

	.deco-brand {
		font-size: 28rpx;
		color: #FFB6C1;
		font-weight: 700;
		margin-bottom: 10rpx;
	}

	.deco-slogan {
		font-size: 24rpx;
		color: #CCC;
	}
}

/* 浮动按钮 */
.float-action {
	position: fixed;
	left: 50%;
	bottom: 50rpx;
	transform: translateX(-50%);
	z-index: 999;

	.action-btn {
		display: flex;
		align-items: center;
		gap: 15rpx;
		padding: 30rpx 50rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 60rpx;
		box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.5);
		transition: all 0.3s;

		&:active {
			transform: scale(0.95);
		}

		.btn-icon {
			font-size: 36rpx;
		}

		.btn-text {
			font-size: 30rpx;
			font-weight: 700;
		}
	}
}

.bottom-space {
	height: 150rpx;
}
</style>
