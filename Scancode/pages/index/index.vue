<template>
	<view class="album-home">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<text class="navbar-title">🐾 我的相册</text>
				<view class="navbar-actions">
					<view class="share-btn" @tap="shareAlbum">
						<text class="icon">📤</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 主内容区 -->
		<scroll-view
			class="content"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 用户信息卡片 -->
			<view class="user-card" v-if="userInfo">
				<view class="user-avatar-wrapper">
					<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
					<view class="avatar-deco">✨</view>
				</view>
				<view class="user-info">
					<text class="user-name">{{ userInfo.nickName }}</text>
					<text class="album-count">📷 {{ photoCount }} 张照片</text>
				</view>
			</view>

			<!-- 登录提示 -->
			<view class="login-card" v-else>
				<text class="login-icon">🐱</text>
				<text class="login-title">登录查看您的宠物相册</text>
				<button class="login-btn" @tap="handleLogin" open-type="getUserInfo" @getuserinfo="onGetUserInfo">
					<text>微信登录</text>
				</button>
			</view>

			<!-- 照片网格 -->
			<view class="photos-section" v-if="userInfo && photos.length > 0">
				<view class="section-header">
					<text class="section-title">🌈 我的宠物</text>
				</view>
				<view class="photo-grid">
					<view
						class="photo-item"
						v-for="(photo, index) in photos"
						:key="photo._id"
						@tap="previewPhoto(index)"
					>
						<image class="photo-img" :src="photo.url" mode="aspectFill"></image>
						<view class="photo-mask">
							<text class="photo-date">{{ formatDate(photo.createTime) }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="userInfo && photos.length === 0">
				<text class="empty-icon">📸</text>
				<text class="empty-text">还没有照片哦</text>
				<text class="empty-hint">快去上传你的萌宠照片吧~</text>
				<button class="upload-btn" @tap="goToUpload">
					<text>上传照片</text>
				</button>
			</view>

			<!-- 底部装饰 -->
			<view class="bottom-deco">
				<text class="deco-text">🐾 记录每一个美好瞬间 🐾</text>
			</view>
		</scroll-view>

		<!-- 浮动上传按钮 -->
		<view class="float-upload-btn" @tap="goToUpload" v-if="userInfo">
			<text class="float-btn-icon">➕</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: null,
			photos: [],
			photoCount: 0,
			refreshing: false
		}
	},
	onLoad() {
		this.checkLogin()
	},
	onShow() {
		if (this.userInfo) {
			this.loadPhotos()
		}
	},
	onPullDownRefresh() {
		this.onRefresh()
	},
	methods: {
		// 检查登录状态
		async checkLogin() {
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					this.userInfo = userInfo
					await this.loadPhotos()
				}
			} catch (e) {
				console.error('检查登录失败', e)
			}
		},

		// 微信登录
		async handleLogin() {
			try {
				// 先获取用户信息授权
				const [error, res] = await uni.getUserProfile({
					desc: '用于展示个人信息',
					lang: 'zh_CN'
				})

				if (error) {
					uni.showToast({ title: '登录取消', icon: 'none' })
					return
				}

				// 获取微信登录凭证
				const loginRes = await uni.login()

				// 调用云函数进行登录
				const result = await uniCloud.callFunction({
					name: 'user-login',
					data: {
						code: loginRes[1].code,
						userInfo: res.userInfo
					}
				})

				if (result.result.code === 0) {
					this.userInfo = result.result.data.userInfo
					uni.setStorageSync('userInfo', this.userInfo)
					uni.setStorageSync('userId', result.result.data.userId)

					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})

					await this.loadPhotos()
				}
			} catch (e) {
				console.error('登录失败', e)
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				})
			}
		},

		// 加载照片
		async loadPhotos() {
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) return

				const res = await uniCloud.callFunction({
					name: 'get-photos',
					data: { userId }
				})

				if (res.result.code === 0) {
					this.photos = res.result.data.photos
					this.photoCount = this.photos.length
				}
			} catch (e) {
				console.error('加载照片失败', e)
			}
		},

		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			await this.loadPhotos()
			this.refreshing = false
			uni.stopPullDownRefresh()
		},

		// 预览照片
		previewPhoto(index) {
			const urls = this.photos.map(p => p.url)
			uni.previewImage({
				urls,
				current: index
			})
		},

		// 跳转上传
		goToUpload() {
			uni.switchTab({
				url: '/pages/upload/index'
			})
		},

		// 分享相册
		shareAlbum() {
			const userId = uni.getStorageSync('userId')
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})

			uni.showToast({
				title: '点击右上角分享',
				icon: 'none'
			})
		},

		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp)
			const month = date.getMonth() + 1
			const day = date.getDate()
			return `${month}月${day}日`
		},

		// 获取用户信息回调
		onGetUserInfo(e) {
			if (e.detail.userInfo) {
				this.handleLogin()
			}
		}
	},

	// 分享配置
	onShareAppMessage() {
		const userId = uni.getStorageSync('userId')
		const nickname = this.userInfo?.nickName || '我'
		return {
			title: `🐾 ${nickname}的萌宠相册`,
			path: `/pages/album/index?userId=${userId}`,
			imageUrl: this.photos[0]?.url || ''
		}
	},

	onShareTimeline() {
		const userId = uni.getStorageSync('userId')
		const nickname = this.userInfo?.nickName || '我'
		return {
			title: `🐾 ${nickname}的萌宠相册`,
			query: `userId=${userId}`,
			imageUrl: this.photos[0]?.url || ''
		}
	}
}
</script>

<style lang="scss">
.album-home {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 100%);
}

/* 自定义导航栏 */
.custom-navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
	padding-top: calc(var(--status-bar-height) + 10rpx);
	padding-bottom: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.3);

	.navbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;

		.navbar-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #FFFFFF;
			text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
		}

		.navbar-actions {
			.share-btn {
				width: 70rpx;
				height: 70rpx;
				background: rgba(255, 255, 255, 0.3);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.icon {
					font-size: 36rpx;
				}
			}
		}
	}
}

/* 内容区域 */
.content {
	padding-top: calc(var(--status-bar-height) + 110rpx);
	height: 100vh;
	box-sizing: border-box;
}

/* 用户卡片 */
.user-card {
	margin: 30rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.15);
	display: flex;
	align-items: center;

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

/* 登录卡片 */
.login-card {
	margin: 30rpx;
	padding: 80rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.15);
	display: flex;
	flex-direction: column;
	align-items: center;

	.login-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}

	.login-title {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 40rpx;
	}

	.login-btn {
		width: 400rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.4);
	}
}

/* 照片区域 */
.photos-section {
	margin: 30rpx;

	.section-header {
		margin-bottom: 30rpx;

		.section-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #FF69B4;
		}
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;

		.photo-item {
			position: relative;
			width: 100%;
			padding-bottom: 100%;
			border-radius: 20rpx;
			overflow: hidden;
			box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.2);

			.photo-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			.photo-mask {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 10rpx;
				background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);

				.photo-date {
					font-size: 20rpx;
					color: #FFFFFF;
				}
			}
		}
	}
}

/* 空状态 */
.empty-state {
	margin: 100rpx 30rpx;
	padding: 80rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

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
		margin-bottom: 40rpx;
	}

	.upload-btn {
		width: 400rpx;
		height: 90rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.4);
	}
}

/* 底部装饰 */
.bottom-deco {
	padding: 60rpx 30rpx;
	text-align: center;

	.deco-text {
		font-size: 28rpx;
		color: #FFB6C1;
	}
}

/* 浮动按钮 */
.float-upload-btn {
	position: fixed;
	right: 40rpx;
	bottom: 120rpx;
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
	border-radius: 50%;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;

	.float-btn-icon {
		font-size: 60rpx;
		color: #FFFFFF;
		font-weight: 600;
	}
}
</style>
