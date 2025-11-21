<template>
	<view class="profile-page">
		<scroll-view class="content" scroll-y>
			<!-- 个人信息 -->
			<view class="user-section">
				<image class="user-avatar" src="/static/avatar/default.png" mode="aspectFill"></image>
				<text class="username">{{ userInfo.nickname || '点击登录' }}</text>
				<text class="user-desc">{{ userInfo.description || '分享你的宠物生活' }}</text>
				<button class="edit-profile-btn" @tap="editProfile">编辑资料</button>
			</view>

			<!-- 数据统计 -->
			<view class="stats-section">
				<view class="stat-item" @tap="viewPosts">
					<text class="stat-value">{{ stats.posts }}</text>
					<text class="stat-label">动态</text>
				</view>
				<view class="stat-item" @tap="viewFollowing">
					<text class="stat-value">{{ stats.following }}</text>
					<text class="stat-label">关注</text>
				</view>
				<view class="stat-item" @tap="viewFollowers">
					<text class="stat-value">{{ stats.followers }}</text>
					<text class="stat-label">粉丝</text>
				</view>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-item" v-for="item in menuList" :key="item.id" @tap="handleMenuClick(item)">
					<text class="menu-icon">{{ item.icon }}</text>
					<text class="menu-title">{{ item.title }}</text>
					<text class="arrow">→</text>
				</view>
			</view>

			<!-- 设置按钮 -->
			<view class="settings-section">
				<button class="settings-btn" @tap="openSettings">设置</button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				nickname: '宠物爱好者',
				description: '爱宠物，爱生活'
			},
			stats: {
				posts: 15,
				following: 42,
				followers: 128
			},
			menuList: [
				{ id: 1, icon: '📝', title: '我的动态', path: '/pages/my-posts/index' },
				{ id: 2, icon: '❤️', title: '我的点赞', path: '/pages/my-likes/index' },
				{ id: 3, icon: '⭐', title: '我的收藏', path: '/pages/my-favorites/index' },
				{ id: 4, icon: '📋', title: '宠物档案', path: '/pages/business/index' },
				{ id: 5, icon: '📱', title: '联系客服', path: '/pages/customer-service/index' },
				{ id: 6, icon: 'ℹ️', title: '关于我们', path: '/pages/about-us/index' }
			]
		}
	},
	methods: {
		editProfile() {
			uni.navigateTo({
				url: '/pages/edit-profile/index'
			})
		},
		viewPosts() {
			uni.navigateTo({
				url: '/pages/my-posts/index'
			})
		},
		viewFollowing() {
			uni.navigateTo({
				url: '/pages/follow-list/index?type=following'
			})
		},
		viewFollowers() {
			uni.navigateTo({
				url: '/pages/follow-list/index?type=followers'
			})
		},
		handleMenuClick(item) {
			uni.navigateTo({
				url: item.path
			})
		},
		openSettings() {
			uni.navigateTo({
				url: '/pages/settings/index'
			})
		}
	}
}
</script>

<style lang="scss">
.profile-page {
	width: 100%;
	height: 100vh;
	background-color: #F8F8F8;
}

.content {
	height: 100%;
}

.user-section {
	background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
	padding: 60rpx 30rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 20rpx;

	.user-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 4rpx solid #FFFFFF;
		margin-bottom: 20rpx;
	}

	.username {
		font-size: 40rpx;
		font-weight: 600;
		color: #FFFFFF;
		margin-bottom: 10rpx;
	}

	.user-desc {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 30rpx;
	}

	.edit-profile-btn {
		padding: 16rpx 60rpx;
		background-color: rgba(255, 255, 255, 0.3);
		color: #FFFFFF;
		border: 2rpx solid #FFFFFF;
		border-radius: 40rpx;
		font-size: 28rpx;
	}
}

.stats-section {
	display: flex;
	background-color: #FFFFFF;
	padding: 40rpx 30rpx;
	margin-bottom: 20rpx;

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;

		.stat-value {
			font-size: 48rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 10rpx;
		}

		.stat-label {
			font-size: 26rpx;
			color: #999;
		}
	}
}

.menu-section {
	background-color: #FFFFFF;
	margin-bottom: 20rpx;

	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.menu-icon {
			font-size: 40rpx;
			margin-right: 20rpx;
		}

		.menu-title {
			flex: 1;
			font-size: 30rpx;
			color: #333;
		}

		.arrow {
			font-size: 32rpx;
			color: #999;
		}
	}
}

.settings-section {
	padding: 0 30rpx 60rpx;

	.settings-btn {
		width: 100%;
		padding: 28rpx;
		background-color: #FFFFFF;
		color: #333;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
	}
}
</style>
