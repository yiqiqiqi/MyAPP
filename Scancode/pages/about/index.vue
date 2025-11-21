<template>
	<view class="discover-page">
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<view class="search-input">
				<text class="search-icon">🔍</text>
				<input type="text" placeholder="搜索宠物知识、用户..." v-model="searchKeyword" />
			</view>
		</view>

		<scroll-view class="content" scroll-y @scrolltolower="loadMore">
			<!-- 分类导航 -->
			<view class="category-nav">
				<scroll-view scroll-x class="category-scroll">
					<view
						class="category-item"
						:class="{ active: currentCategory === cat.id }"
						v-for="cat in categories"
						:key="cat.id"
						@tap="selectCategory(cat.id)"
					>
						<text>{{ cat.name }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 热门话题 -->
			<view class="section" v-if="currentCategory === 'all'">
				<view class="section-title">
					<text class="title-text">🔥 热门话题</text>
				</view>
				<view class="topic-list">
					<view class="topic-item" v-for="topic in hotTopics" :key="topic.id">
						<view class="topic-info">
							<text class="topic-title">#{{ topic.name }}</text>
							<text class="topic-count">{{ topic.count }} 篇内容</text>
						</view>
						<text class="topic-icon">→</text>
					</view>
				</view>
			</view>

			<!-- 精选内容 -->
			<view class="section">
				<view class="section-title">
					<text class="title-text">✨ 精选内容</text>
				</view>
				<view class="article-list">
					<view class="article-item" v-for="article in articleList" :key="article.id">
						<view class="article-content">
							<text class="article-title">{{ article.title }}</text>
							<text class="article-desc">{{ article.description }}</text>
							<view class="article-meta">
								<text class="meta-item">👁 {{ article.views }}</text>
								<text class="meta-item">❤️ {{ article.likes }}</text>
							</view>
						</view>
						<image class="article-cover" :src="article.cover" mode="aspectFill"></image>
					</view>
				</view>
			</view>

			<!-- 推荐用户 -->
			<view class="section" v-if="currentCategory === 'all'">
				<view class="section-title">
					<text class="title-text">👥 推荐关注</text>
				</view>
				<view class="user-list">
					<view class="user-item" v-for="user in recommendUsers" :key="user.id">
						<image class="user-avatar" :src="user.avatar" mode="aspectFill"></image>
						<view class="user-info">
							<text class="user-name">{{ user.name }}</text>
							<text class="user-desc">{{ user.description }}</text>
						</view>
						<button class="follow-btn" :class="{ followed: user.isFollowed }">
							{{ user.isFollowed ? '已关注' : '关注' }}
						</button>
					</view>
				</view>
			</view>

			<!-- 加载提示 -->
			<view class="loading-more" v-if="loading">
				<text>加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchKeyword: '',
			currentCategory: 'all',
			categories: [
				{ id: 'all', name: '全部' },
				{ id: 'dog', name: '狗狗' },
				{ id: 'cat', name: '猫咪' },
				{ id: 'bird', name: '鸟类' },
				{ id: 'fish', name: '水族' },
				{ id: 'health', name: '健康' },
				{ id: 'training', name: '训练' },
				{ id: 'food', name: '饮食' }
			],
			hotTopics: [
				{ id: 1, name: '新手养宠', count: 1280 },
				{ id: 2, name: '宠物健康', count: 956 },
				{ id: 3, name: '宠物训练', count: 745 },
				{ id: 4, name: '宠物美容', count: 632 }
			],
			articleList: [
				{
					id: 1,
					title: '如何正确给狗狗洗澡？新手必看指南',
					description: '详细讲解给狗狗洗澡的步骤、注意事项和常见误区...',
					cover: '/static/demo/article1.jpg',
					views: 2580,
					likes: 326
				},
				{
					id: 2,
					title: '猫咪不吃东西怎么办？这5个原因要注意',
					description: '分析猫咪厌食的常见原因和解决方法...',
					cover: '/static/demo/article2.jpg',
					views: 1890,
					likes: 245
				},
				{
					id: 3,
					title: '宠物疫苗接种完全指南',
					description: '包括疫苗种类、接种时间、注意事项等...',
					cover: '/static/demo/article3.jpg',
					views: 3210,
					likes: 512
				}
			],
			recommendUsers: [
				{
					id: 1,
					name: '宠物医生王医生',
					description: '执业兽医 | 分享宠物健康知识',
					avatar: '/static/avatar/doctor.png',
					isFollowed: false
				},
				{
					id: 2,
					name: '训犬师小李',
					description: '专业训犬10年 | 分享训犬技巧',
					avatar: '/static/avatar/trainer.png',
					isFollowed: true
				}
			],
			loading: false
		}
	},
	methods: {
		selectCategory(id) {
			this.currentCategory = id
			this.articleList = []
			this.loadArticles()
		},

		async loadArticles() {
			this.loading = true
			// 实际应调用云函数加载文章
			// const res = await uniCloud.callFunction({
			// 	name: 'get_articles',
			// 	data: { category: this.currentCategory }
			// })
			setTimeout(() => {
				this.loading = false
			}, 500)
		},

		loadMore() {
			// 加载更多内容
		}
	}
}
</script>

<style lang="scss">
.discover-page {
	width: 100%;
	height: 100vh;
	background-color: #F8F8F8;
	display: flex;
	flex-direction: column;
}

.search-bar {
	background-color: #FFFFFF;
	padding: 20rpx 30rpx;

	.search-input {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 40rpx;
		padding: 16rpx 30rpx;

		.search-icon {
			font-size: 32rpx;
			margin-right: 10rpx;
		}

		input {
			flex: 1;
			font-size: 28rpx;
		}
	}
}

.content {
	flex: 1;
}

.category-nav {
	background-color: #FFFFFF;
	padding: 20rpx 0;
	margin-bottom: 20rpx;

	.category-scroll {
		white-space: nowrap;
		padding: 0 30rpx;
	}

	.category-item {
		display: inline-block;
		padding: 12rpx 30rpx;
		margin-right: 20rpx;
		background-color: #F5F5F5;
		border-radius: 30rpx;
		font-size: 28rpx;
		color: #666;
		transition: all 0.3s;

		&.active {
			background-color: #FF6B6B;
			color: #FFFFFF;
		}
	}
}

.section {
	background-color: #FFFFFF;
	margin-bottom: 20rpx;
	padding: 30rpx;

	.section-title {
		margin-bottom: 30rpx;

		.title-text {
			font-size: 34rpx;
			font-weight: 600;
			color: #333;
		}
	}
}

.topic-list {
	.topic-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.topic-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.topic-title {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.topic-count {
				font-size: 24rpx;
				color: #999;
			}
		}

		.topic-icon {
			font-size: 32rpx;
			color: #999;
		}
	}
}

.article-list {
	.article-item {
		display: flex;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.article-content {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			margin-right: 20rpx;

			.article-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 12rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.article-desc {
				font-size: 26rpx;
				color: #999;
				margin-bottom: 12rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.article-meta {
				display: flex;
				gap: 30rpx;

				.meta-item {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.article-cover {
			width: 200rpx;
			height: 150rpx;
			border-radius: 12rpx;
			background-color: #F0F0F0;
		}
	}
}

.user-list {
	.user-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #F0F0F0;

		&:last-child {
			border-bottom: none;
		}

		.user-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 20rpx;
			background-color: #F0F0F0;
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 30rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}

			.user-desc {
				font-size: 26rpx;
				color: #999;
			}
		}

		.follow-btn {
			padding: 12rpx 32rpx;
			background-color: #FF6B6B;
			color: #FFFFFF;
			border: none;
			border-radius: 30rpx;
			font-size: 26rpx;

			&.followed {
				background-color: #F5F5F5;
				color: #666;
			}
		}
	}
}

.loading-more {
	text-align: center;
	padding: 40rpx;
	font-size: 28rpx;
	color: #999;
}
</style>
