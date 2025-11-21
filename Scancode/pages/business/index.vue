<template>
	<view class="pets-page">
		<scroll-view class="content" scroll-y>
			<!-- 顶部统计 -->
			<view class="stats-section">
				<view class="stat-item">
					<text class="stat-value">{{ petCount }}</text>
					<text class="stat-label">我的宠物</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ postCount }}</text>
					<text class="stat-label">发布动态</text>
				</view>
			</view>

			<!-- 宠物列表 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">我的宠物</text>
					<button class="add-pet-btn" @tap="addPet">+ 添加宠物</button>
				</view>

				<view class="pet-list">
					<view class="pet-card" v-for="pet in petList" :key="pet.id" @tap="viewPetDetail(pet)">
						<image class="pet-avatar" :src="pet.avatar" mode="aspectFill"></image>
						<view class="pet-info">
							<text class="pet-name">{{ pet.name }}</text>
							<text class="pet-type">{{ pet.type }} · {{ pet.age }}岁 · {{ pet.gender }}</text>
							<text class="pet-desc" v-if="pet.description">{{ pet.description }}</text>
						</view>
						<text class="arrow">→</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			petCount: 2,
			postCount: 15,
			petList: [
				{
					id: '1',
					name: '大黄',
					type: '金毛',
					age: 3,
					gender: '公',
					avatar: '/static/pets/dog1.jpg',
					description: '活泼可爱的金毛宝宝'
				},
				{
					id: '2',
					name: '咪咪',
					type: '英短',
					age: 2,
					gender: '母',
					avatar: '/static/pets/cat1.jpg',
					description: '高冷的猫主子'
				}
			]
		}
	},
	methods: {
		addPet() {
			uni.navigateTo({
				url: '/pages/add-pet/index'
			})
		},
		viewPetDetail(pet) {
			uni.navigateTo({
				url: `/pages/pet-detail/index?id=${pet.id}`
			})
		}
	}
}
</script>

<style lang="scss">
.pets-page {
	width: 100%;
	height: 100vh;
	background-color: #F8F8F8;
}

.content {
	height: 100%;
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
			color: #FF6B6B;
			margin-bottom: 10rpx;
		}

		.stat-label {
			font-size: 26rpx;
			color: #999;
		}
	}
}

.section {
	background-color: #FFFFFF;
	padding: 30rpx;
	margin-bottom: 20rpx;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;

		.section-title {
			font-size: 34rpx;
			font-weight: 600;
			color: #333;
		}

		.add-pet-btn {
			padding: 12rpx 24rpx;
			background-color: #FF6B6B;
			color: #FFFFFF;
			border: none;
			border-radius: 30rpx;
			font-size: 26rpx;
		}
	}
}

.pet-list {
	.pet-card {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.pet-avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 16rpx;
			margin-right: 20rpx;
			background-color: #F0F0F0;
		}

		.pet-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.pet-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}

			.pet-type {
				font-size: 26rpx;
				color: #999;
				margin-bottom: 8rpx;
			}

			.pet-desc {
				font-size: 24rpx;
				color: #666;
			}
		}

		.arrow {
			font-size: 32rpx;
			color: #999;
		}
	}
}
</style>
