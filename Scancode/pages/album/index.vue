<template>
	<view class="album-view">
		<scroll-view
			class="content"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 用户信息卡片 -->
			<view class="user-card" v-if="albumOwner">
				<view class="user-header">
					<view class="user-avatar-wrapper">
						<image class="user-avatar" :src="albumOwner.avatarUrl" mode="aspectFill"></image>
						<view class="avatar-deco">✨</view>
					</view>
					<view class="user-info">
						<text class="user-name">{{ albumOwner.nickName }}</text>
						<text class="album-count">📷 {{ photos.length }} 张照片</text>
					</view>
				</view>
				<view class="album-title">
					<text class="title-emoji">🐾</text>
					<text class="title-text">{{ albumOwner.nickName }}的萌宠相册</text>
				</view>
			</view>

			<!-- 加载中 -->
			<view class="loading-card" v-if="loading && !albumOwner">
				<text class="loading-icon">🔄</text>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 照片列表 -->
			<view class="photos-section" v-if="photos.length > 0">
				<!-- 瀑布流布局 -->
				<view class="photo-waterfall">
					<view
						class="photo-item"
						v-for="(photo, index) in photos"
						:key="photo._id"
						@tap="previewPhoto(index)"
					>
						<image
							class="photo-img"
							:src="photo.url"
							mode="widthFix"
							@load="onImageLoad"
						></image>
						<view class="photo-info" v-if="photo.description || photo.petName">
							<text class="photo-pet" v-if="photo.petName">
								{{ photo.petType }} {{ photo.petName }}
							</text>
							<text class="photo-desc" v-if="photo.description">
								{{ photo.description }}
							</text>
							<text class="photo-date">{{ formatDate(photo.createTime) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && photos.length === 0">
				<text class="empty-icon">📭</text>
				<text class="empty-text">还没有照片哦</text>
				<text class="empty-hint">TA还没有上传照片呢~</text>
			</view>

			<!-- 底部装饰 -->
			<view class="bottom-deco">
				<text class="deco-line">🌸 🐾 🌸</text>
				<text class="deco-text">喵汪兔星河 · 记录萌宠时光</text>
			</view>
		</scroll-view>

		<!-- 浮动按钮 - 也要建立相册 -->
		<view class="float-btn" @tap="goToMyAlbum">
			<text class="float-btn-text">我也要建立相册</text>
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
			uni.showToast({
				title: '参数错误',
				icon: 'none'
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
				} else {
					throw new Error(res.result.msg || '加载失败')
				}
			} catch (error) {
				console.error('加载相册失败', error)
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
			return `${year}年${month}月${day}日`
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
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 100%);
}

.content {
	height: 100vh;
	padding: 30rpx;
	box-sizing: border-box;
}

/* 用户卡片 */
.user-card {
	padding: 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.15);
	margin-bottom: 30rpx;

	.user-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;

		.user-avatar-wrapper {
			position: relative;
			margin-right: 30rpx;

			.user-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 6rpx solid #FFB6C1;
			}

			.avatar-deco {
				position: absolute;
				bottom: -10rpx;
				right: -10rpx;
				font-size: 40rpx;
			}
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 36rpx;
				font-weight: 600;
				color: #FF69B4;
				margin-bottom: 10rpx;
			}

			.album-count {
				font-size: 28rpx;
				color: #999;
			}
		}
	}

	.album-title {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		background: rgba(255, 105, 180, 0.1);
		border-radius: 20rpx;

		.title-emoji {
			font-size: 32rpx;
			margin-right: 10rpx;
		}

		.title-text {
			font-size: 30rpx;
			color: #FF69B4;
			font-weight: 600;
		}
	}
}

/* 加载中 */
.loading-card {
	padding: 100rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.loading-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		animation: rotate 1s linear infinite;
	}

	.loading-text {
		font-size: 28rpx;
		color: #999;
	}
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

/* 照片瀑布流 */
.photos-section {
	margin-bottom: 30rpx;

	.photo-waterfall {
		column-count: 2;
		column-gap: 20rpx;

		.photo-item {
			break-inside: avoid;
			margin-bottom: 20rpx;
			background: #FFFFFF;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.15);

			.photo-img {
				width: 100%;
				display: block;
			}

			.photo-info {
				padding: 20rpx;

				.photo-pet {
					display: block;
					font-size: 26rpx;
					color: #FF69B4;
					font-weight: 600;
					margin-bottom: 10rpx;
				}

				.photo-desc {
					display: block;
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
					margin-bottom: 10rpx;
				}

				.photo-date {
					display: block;
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
}

/* 空状态 */
.empty-state {
	padding: 100rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx;

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.empty-hint {
		font-size: 28rpx;
		color: #999;
	}
}

/* 底部装饰 */
.bottom-deco {
	padding: 40rpx 0 120rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.deco-line {
		font-size: 32rpx;
		margin-bottom: 20rpx;
	}

	.deco-text {
		font-size: 26rpx;
		color: #FFB6C1;
	}
}

/* 浮动按钮 */
.float-btn {
	position: fixed;
	left: 50%;
	bottom: 40rpx;
	transform: translateX(-50%);
	padding: 24rpx 50rpx;
	background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
	border-radius: 50rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.5);
	z-index: 999;

	.float-btn-text {
		font-size: 30rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
}
</style>
