<template>
	<view class="profile-page">
		<scroll-view class="content" scroll-y>
			<!-- 用户信息卡片 -->
			<view class="user-section" v-if="userInfo">
				<view class="user-bg"></view>
				<view class="user-content">
					<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
					<text class="user-name">{{ userInfo.nickName }}</text>
					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-value">{{ photoCount }}</text>
							<text class="stat-label">照片</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 未登录 -->
			<view class="login-section" v-else>
				<text class="login-icon">🐱</text>
				<text class="login-hint">登录后查看更多功能</text>
				<button class="login-btn" @tap="goToHome">
					<text>去登录</text>
				</button>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-item" @tap="goToAlbum">
					<text class="menu-icon">📷</text>
					<text class="menu-title">我的相册</text>
					<text class="menu-arrow">→</text>
				</view>
				<view class="menu-item" @tap="shareMyAlbum">
					<text class="menu-icon">📤</text>
					<text class="menu-title">分享我的相册</text>
					<text class="menu-arrow">→</text>
				</view>
				<view class="menu-item" @tap="goToAbout">
					<text class="menu-icon">ℹ️</text>
					<text class="menu-title">关于我们</text>
					<text class="menu-arrow">→</text>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section" v-if="userInfo">
				<button class="logout-btn" @tap="handleLogout">
					<text>退出登录</text>
				</button>
			</view>

			<!-- 版权信息 -->
			<view class="copyright">
				<text class="copyright-text">© 2024 杭州喵汪兔星河科技有限公司</text>
				<text class="copyright-text">记录每一个萌宠瞬间 🐾</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: null,
			photoCount: 0
		}
	},
	onShow() {
		this.loadUserInfo()
	},
	methods: {
		// 加载用户信息
		async loadUserInfo() {
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					this.userInfo = userInfo
					await this.loadPhotoCount()
				}
			} catch (e) {
				console.error('加载用户信息失败', e)
			}
		},

		// 加载照片数量
		async loadPhotoCount() {
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) return

				const res = await uniCloud.callFunction({
					name: 'get-photos',
					data: { userId }
				})

				if (res.result.code === 0) {
					this.photoCount = res.result.data.photos.length
				}
			} catch (e) {
				console.error('加载照片数量失败', e)
			}
		},

		// 跳转首页
		goToHome() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		},

		// 跳转相册
		goToAlbum() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		},

		// 分享相册
		shareMyAlbum() {
			const userId = uni.getStorageSync('userId')
			if (!userId) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				return
			}

			uni.showToast({
				title: '点击右上角分享',
				icon: 'none'
			})
		},

		// 跳转关于页面
		goToAbout() {
			uni.navigateTo({
				url: '/pages/about/index'
			})
		},

		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('userInfo')
						uni.removeStorageSync('userId')
						this.userInfo = null
						this.photoCount = 0
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
					}
				}
			})
		}
	},
	onShareAppMessage() {
		const userId = uni.getStorageSync('userId')
		const nickname = this.userInfo?.nickName || '我'
		return {
			title: `🐾 ${nickname}的萌宠相册`,
			path: `/pages/album/index?userId=${userId}`
		}
	}
}
</script>

<style lang="scss">
.profile-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 100%);
}

.content {
	height: 100vh;
	box-sizing: border-box;
}

/* 用户信息 */
.user-section {
	position: relative;
	margin: 30rpx;
	border-radius: 30rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.2);

	.user-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 300rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
	}

	.user-content {
		position: relative;
		padding: 60rpx 40rpx 40rpx;
		background: linear-gradient(to bottom, transparent 0%, #FFFFFF 200rpx);
		display: flex;
		flex-direction: column;
		align-items: center;

		.user-avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 8rpx solid #FFFFFF;
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
			margin-bottom: 20rpx;
		}

		.user-name {
			font-size: 40rpx;
			font-weight: 600;
			color: #FF69B4;
			margin-bottom: 30rpx;
		}

		.user-stats {
			display: flex;
			width: 100%;
			justify-content: center;

			.stat-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 0 40rpx;

				.stat-value {
					font-size: 44rpx;
					font-weight: 600;
					color: #FF69B4;
					margin-bottom: 8rpx;
				}

				.stat-label {
					font-size: 26rpx;
					color: #999;
				}
			}
		}
	}
}

/* 未登录 */
.login-section {
	margin: 100rpx 30rpx;
	padding: 80rpx 40rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.login-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}

	.login-hint {
		font-size: 28rpx;
		color: #999;
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
	}
}

/* 功能菜单 */
.menu-section {
	margin: 30rpx;
	background: #FFFFFF;
	border-radius: 30rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.1);

	.menu-item {
		display: flex;
		align-items: center;
		padding: 35rpx 30rpx;
		border-bottom: 1rpx solid #F5F5F5;

		&:last-child {
			border-bottom: none;
		}

		.menu-icon {
			font-size: 44rpx;
			margin-right: 20rpx;
		}

		.menu-title {
			flex: 1;
			font-size: 30rpx;
			color: #333;
		}

		.menu-arrow {
			font-size: 32rpx;
			color: #CCC;
		}
	}
}

/* 退出登录 */
.logout-section {
	margin: 30rpx;

	.logout-btn {
		width: 100%;
		height: 90rpx;
		background: #FFFFFF;
		color: #FF6B6B;
		border: 2rpx solid #FF6B6B;
		border-radius: 45rpx;
		font-size: 32rpx;
	}
}

/* 版权信息 */
.copyright {
	padding: 60rpx 30rpx 100rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.copyright-text {
		font-size: 24rpx;
		color: #999;
		line-height: 1.8;
		text-align: center;
	}
}
</style>
