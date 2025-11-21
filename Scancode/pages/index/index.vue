<template>
	<view class="album-home">
		<!-- 波浪装饰 -->
		<view class="wave-decoration">
			<view class="wave wave1"></view>
			<view class="wave wave2"></view>
		</view>

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
			<!-- 游客欢迎卡片 -->
			<view class="welcome-card" v-if="!userInfo">
				<view class="welcome-deco">
					<view class="deco-circle circle1"></view>
					<view class="deco-circle circle2"></view>
					<view class="deco-circle circle3"></view>
				</view>
				<text class="welcome-icon">🎉</text>
				<text class="welcome-title">欢迎使用宠物相册</text>
				<text class="welcome-subtitle">即刻开始记录你的萌宠瞬间</text>

				<view class="welcome-actions">
					<button class="guest-upload-btn" @tap="goToUpload">
						<text class="btn-icon">📸</text>
						<text>快速上传</text>
					</button>
					<button class="login-btn" @tap="handleLogin">
						<text class="btn-icon">✨</text>
						<text>登录永久保存</text>
					</button>
				</view>

				<text class="welcome-tip">💡 游客模式支持临时上传和分享</text>
			</view>

			<!-- 用户信息卡片（已登录） -->
			<view class="user-card" v-else>
				<view class="user-card-bg">
					<view class="bg-circle circle1"></view>
					<view class="bg-circle circle2"></view>
				</view>
				<view class="user-avatar-wrapper">
					<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
					<view class="avatar-badge">✨</view>
				</view>
				<view class="user-info">
					<text class="user-name">{{ userInfo.nickName }}</text>
					<text class="album-count">📷 已保存 {{ photoCount }} 张照片</text>
				</view>
			</view>

			<!-- 快捷操作卡片（已登录） -->
			<view class="quick-actions" v-if="userInfo">
				<view class="action-card" @tap="goToUpload">
					<text class="action-icon">📸</text>
					<text class="action-title">上传照片</text>
				</view>
				<view class="action-card" @tap="shareAlbum">
					<text class="action-icon">💝</text>
					<text class="action-title">分享相册</text>
				</view>
			</view>

			<!-- 游客快速上传卡片 -->
			<view class="guest-quick-card" v-if="!userInfo && guestPhotos.length === 0">
				<text class="guest-quick-icon">🎨</text>
				<text class="guest-quick-title">开始你的第一次上传</text>
				<text class="guest-quick-subtitle">无需登录，即刻体验</text>
				<button class="quick-upload-btn" @tap="goToUpload">
					<text>立即上传</text>
				</button>
			</view>

			<!-- 照片网格 -->
			<view class="photos-section" v-if="displayPhotos.length > 0">
				<view class="section-header">
					<text class="section-title">
						{{ userInfo ? '🌈 我的宠物' : '📱 临时相册' }}
					</text>
					<text class="section-subtitle" v-if="!userInfo">
						登录后永久保存
					</text>
				</view>
				<view class="photo-grid">
					<view
						class="photo-item"
						v-for="(photo, index) in displayPhotos"
						:key="photo.id || photo._id"
						@tap="previewPhoto(index)"
					>
						<image class="photo-img" :src="photo.url" mode="aspectFill"></image>
						<view class="photo-overlay">
							<view class="photo-info">
								<text class="photo-date">{{ formatDate(photo.createTime) }}</text>
								<text class="photo-badge" v-if="!userInfo">临时</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="displayPhotos.length === 0 && userInfo">
				<view class="empty-animation">
					<text class="empty-icon pulse">📸</text>
				</view>
				<text class="empty-text">还没有照片哦</text>
				<text class="empty-hint">快去上传你的萌宠照片吧~</text>
				<button class="upload-btn" @tap="goToUpload">
					<text>📷 上传照片</text>
				</button>
			</view>

			<!-- 底部装饰 -->
			<view class="bottom-deco">
				<view class="deco-icons">
					<text>🐶</text>
					<text>🐱</text>
					<text>🐰</text>
					<text>🐹</text>
				</view>
				<text class="deco-text">记录每一个美好瞬间</text>
			</view>
		</scroll-view>

		<!-- 浮动上传按钮 -->
		<view class="float-upload-btn" @tap="goToUpload">
			<text class="float-btn-icon">➕</text>
			<view class="float-btn-ripple"></view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: null,
			photos: [], // 云端照片
			guestPhotos: [], // 游客本地照片
			photoCount: 0,
			refreshing: false
		}
	},
	computed: {
		// 显示的照片列表（优先显示云端，否则显示本地）
		displayPhotos() {
			if (this.userInfo) {
				return this.photos
			} else {
				return this.guestPhotos
			}
		}
	},
	onLoad() {
		this.checkLogin()
		// 如果未登录，加载本地照片
		if (!this.userInfo) {
			this.loadLocalPhotos()
		}
	},
	onShow() {
		if (this.userInfo) {
			this.loadPhotos()
		} else {
			this.loadLocalPhotos()
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
					// 检查是否有游客照片需要迁移
					await this.migrateGuestPhotos()
				}
			} catch (e) {
				console.error('检查登录失败', e)
			}
		},

		// 加载本地照片（游客模式）
		loadLocalPhotos() {
			try {
				const localPhotos = uni.getStorageSync('guestPhotos')
				if (localPhotos && Array.isArray(localPhotos)) {
					this.guestPhotos = localPhotos
				}
			} catch (e) {
				console.error('加载本地照片失败', e)
			}
		},

		// 迁移游客照片到云端（登录后）
		async migrateGuestPhotos() {
			try {
				const guestPhotos = uni.getStorageSync('guestPhotos')
				if (!guestPhotos || guestPhotos.length === 0) {
					return
				}

				// 询问用户是否迁移
				const [error, res] = await uni.showModal({
					title: '发现临时照片',
					content: `检测到 ${guestPhotos.length} 张临时照片，是否保存到云端？`,
					confirmText: '保存',
					cancelText: '删除'
				})

				if (res.confirm) {
					// 上传到云端
					const userId = uni.getStorageSync('userId')
					const photoRecords = guestPhotos.map(photo => ({
						fileID: photo.fileID || '',
						url: photo.url,
						description: photo.description || '',
						petName: photo.petName || '',
						petType: photo.petType || ''
					}))

					await uniCloud.callFunction({
						name: 'upload-photos',
						data: {
							userId: userId,
							photos: photoRecords
						}
					})

					uni.showToast({
						title: '照片已保存到云端',
						icon: 'success'
					})

					// 清除本地照片
					uni.removeStorageSync('guestPhotos')
					this.guestPhotos = []

					// 重新加载云端照片
					await this.loadPhotos()
				} else {
					// 用户选择删除
					uni.removeStorageSync('guestPhotos')
					this.guestPhotos = []
				}
			} catch (e) {
				console.error('迁移照片失败', e)
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
					// 登录后检查游客照片
					await this.migrateGuestPhotos()
				}
			} catch (e) {
				console.error('登录失败', e)
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				})
			}
		},

		// 加载云端照片
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
			if (this.userInfo) {
				await this.loadPhotos()
			} else {
				this.loadLocalPhotos()
			}
			this.refreshing = false
			uni.stopPullDownRefresh()
		},

		// 预览照片
		previewPhoto(index) {
			const urls = this.displayPhotos.map(p => p.url)
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
			if (this.userInfo) {
				// 已登录用户的分享
				uni.showShareMenu({
					withShareTicket: true,
					menus: ['shareAppMessage', 'shareTimeline']
				})

				uni.showToast({
					title: '点击右上角分享',
					icon: 'none'
				})
			} else {
				// 游客模式的分享
				if (this.guestPhotos.length === 0) {
					uni.showToast({
						title: '还没有照片可以分享',
						icon: 'none'
					})
					return
				}

				uni.showToast({
					title: '点击右上角分享临时相册',
					icon: 'none'
				})
			}
		},

		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp)
			const month = date.getMonth() + 1
			const day = date.getDate()
			return `${month}/${day}`
		}
	},

	// 分享配置
	onShareAppMessage() {
		if (this.userInfo) {
			const userId = uni.getStorageSync('userId')
			const nickname = this.userInfo?.nickName || '我'
			return {
				title: `🐾 ${nickname}的萌宠相册`,
				path: `/pages/album/index?userId=${userId}`,
				imageUrl: this.photos[0]?.url || ''
			}
		} else {
			return {
				title: '🐾 快来看我的宠物相册',
				path: '/pages/index/index'
			}
		}
	},

	onShareTimeline() {
		if (this.userInfo) {
			const userId = uni.getStorageSync('userId')
			const nickname = this.userInfo?.nickName || '我'
			return {
				title: `🐾 ${nickname}的萌宠相册`,
				query: `userId=${userId}`,
				imageUrl: this.photos[0]?.url || ''
			}
		} else {
			return {
				title: '🐾 宠物相册小程序',
				query: ''
			}
		}
	}
}
</script>

<style lang="scss">
.album-home {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 50%, #FFF5F7 100%);
	position: relative;
	overflow: hidden;
}

/* 波浪装饰 */
.wave-decoration {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 300rpx;
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
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.3);

	.navbar-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;

		.navbar-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #FFFFFF;
			text-shadow: 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.1);
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
				backdrop-filter: blur(10rpx);
				transition: all 0.3s;

				&:active {
					transform: scale(0.9);
				}

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

/* 游客欢迎卡片 */
.welcome-card {
	position: relative;
	margin: 30rpx;
	padding: 60rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;

	.welcome-deco {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;

		.deco-circle {
			position: absolute;
			border-radius: 50%;
			opacity: 0.1;
		}

		.circle1 {
			width: 200rpx;
			height: 200rpx;
			background: #FFB6C1;
			top: -50rpx;
			right: -50rpx;
		}

		.circle2 {
			width: 150rpx;
			height: 150rpx;
			background: #FF69B4;
			bottom: -30rpx;
			left: -30rpx;
		}

		.circle3 {
			width: 100rpx;
			height: 100rpx;
			background: #FFB6C1;
			top: 50%;
			left: 20rpx;
		}
	}

	.welcome-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
		z-index: 1;
		animation: bounce 2s ease-in-out infinite;
	}

	.welcome-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #FF69B4;
		margin-bottom: 15rpx;
		z-index: 1;
	}

	.welcome-subtitle {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 50rpx;
		z-index: 1;
	}

	.welcome-actions {
		width: 100%;
		display: flex;
		gap: 20rpx;
		margin-bottom: 30rpx;
		z-index: 1;

		.guest-upload-btn,
		.login-btn {
			flex: 1;
			height: 90rpx;
			border-radius: 45rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			font-size: 28rpx;
			font-weight: 600;
			box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.3);
			transition: all 0.3s;

			&:active {
				transform: translateY(2rpx);
			}

			.btn-icon {
				font-size: 32rpx;
			}
		}

		.guest-upload-btn {
			background: linear-gradient(135deg, #FFE8EE 0%, #FFB6C1 100%);
			color: #FF69B4;
		}

		.login-btn {
			background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
			color: #FFFFFF;
		}
	}

	.welcome-tip {
		font-size: 24rpx;
		color: #FFB6C1;
		z-index: 1;
	}
}

@keyframes bounce {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-20rpx);
	}
}

/* 用户卡片 */
.user-card {
	position: relative;
	margin: 30rpx;
	padding: 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);
	display: flex;
	align-items: center;
	overflow: hidden;

	.user-card-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 0;

		.bg-circle {
			position: absolute;
			border-radius: 50%;
			opacity: 0.08;
		}

		.circle1 {
			width: 180rpx;
			height: 180rpx;
			background: #FFB6C1;
			top: -50rpx;
			right: -50rpx;
		}

		.circle2 {
			width: 120rpx;
			height: 120rpx;
			background: #FF69B4;
			bottom: -30rpx;
			left: -30rpx;
		}
	}

	.user-avatar-wrapper {
		position: relative;
		margin-right: 30rpx;
		z-index: 1;

		.user-avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			border: 6rpx solid #FFB6C1;
			box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.3);
		}

		.avatar-badge {
			position: absolute;
			bottom: -5rpx;
			right: -5rpx;
			font-size: 40rpx;
			filter: drop-shadow(2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1));
		}
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		z-index: 1;

		.user-name {
			font-size: 36rpx;
			font-weight: 700;
			color: #FF69B4;
			margin-bottom: 10rpx;
		}

		.album-count {
			font-size: 26rpx;
			color: #999;
		}
	}
}

/* 快捷操作卡片 */
.quick-actions {
	margin: 0 30rpx 30rpx;
	display: flex;
	gap: 20rpx;

	.action-card {
		flex: 1;
		padding: 40rpx 20rpx;
		background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
		border-radius: 30rpx;
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15rpx;
		transition: all 0.3s;

		&:active {
			transform: translateY(-5rpx);
			box-shadow: 0 12rpx 30rpx rgba(255, 105, 180, 0.25);
		}

		.action-icon {
			font-size: 60rpx;
		}

		.action-title {
			font-size: 28rpx;
			color: #FF69B4;
			font-weight: 600;
		}
	}
}

/* 游客快速卡片 */
.guest-quick-card {
	margin: 30rpx;
	padding: 60rpx 40rpx;
	background: linear-gradient(135deg, #FFE8EE 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	border: 3rpx dashed #FFB6C1;
	display: flex;
	flex-direction: column;
	align-items: center;

	.guest-quick-icon {
		font-size: 100rpx;
		margin-bottom: 20rpx;
	}

	.guest-quick-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF69B4;
		margin-bottom: 10rpx;
	}

	.guest-quick-subtitle {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.quick-upload-btn {
		width: 400rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.4);
	}
}

/* 照片区域 */
.photos-section {
	margin: 30rpx;

	.section-header {
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.section-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #FF69B4;
		}

		.section-subtitle {
			font-size: 24rpx;
			color: #FFB6C1;
			padding: 8rpx 20rpx;
			background: rgba(255, 182, 193, 0.2);
			border-radius: 20rpx;
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
			border-radius: 25rpx;
			overflow: hidden;
			box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.2);
			transition: all 0.3s;

			&:active {
				transform: scale(0.95);
			}

			.photo-img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			.photo-overlay {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 15rpx;
				background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);

				.photo-info {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.photo-date {
						font-size: 22rpx;
						color: #FFFFFF;
						font-weight: 500;
					}

					.photo-badge {
						font-size: 20rpx;
						color: #FFB6C1;
						background: rgba(255, 255, 255, 0.9);
						padding: 4rpx 12rpx;
						border-radius: 10rpx;
					}
				}
			}
		}
	}
}

/* 空状态 */
.empty-state {
	margin: 80rpx 30rpx;
	padding: 80rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 40rpx;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.15);
	display: flex;
	flex-direction: column;
	align-items: center;

	.empty-animation {
		margin-bottom: 30rpx;

		.empty-icon {
			font-size: 140rpx;
			display: inline-block;
		}

		.pulse {
			animation: pulse 2s ease-in-out infinite;
		}
	}

	.empty-text {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 10rpx;
		font-weight: 600;
	}

	.empty-hint {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 50rpx;
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

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

/* 底部装饰 */
.bottom-deco {
	padding: 60rpx 30rpx;
	text-align: center;

	.deco-icons {
		display: flex;
		justify-content: center;
		gap: 30rpx;
		margin-bottom: 20rpx;
		font-size: 40rpx;
		opacity: 0.6;
	}

	.deco-text {
		font-size: 26rpx;
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
	box-shadow: 0 10rpx 30rpx rgba(255, 105, 180, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	transition: all 0.3s;

	&:active {
		transform: scale(0.9);
	}

	.float-btn-icon {
		font-size: 60rpx;
		color: #FFFFFF;
		font-weight: 600;
	}

	.float-btn-ripple {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 4rpx solid #FFB6C1;
		animation: ripple 2s ease-out infinite;
	}
}

@keyframes ripple {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}
</style>
