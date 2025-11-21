<template>
	<view class="pet-community">
		<!-- 宠物动态列表 -->
		<scroll-view
			class="post-list"
			scroll-y
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 动态列表 -->
			<view class="post-item" v-for="post in postList" :key="post.id">
				<!-- 用户信息 -->
				<view class="post-header">
					<image class="avatar" :src="post.avatar" mode="aspectFill"></image>
					<view class="user-info">
						<text class="username">{{ post.username }}</text>
						<text class="post-time">{{ formatTime(post.createTime) }}</text>
					</view>
				</view>

				<!-- 动态内容 -->
				<view class="post-content">
					<text class="content-text">{{ post.content }}</text>

					<!-- 宠物标签 -->
					<view class="pet-tags" v-if="post.petName">
						<text class="pet-tag">#{{ post.petName }}</text>
						<text class="pet-tag" v-if="post.petType">#{{ post.petType }}</text>
					</view>

					<!-- 图片展示 -->
					<view class="image-grid" v-if="post.images && post.images.length > 0">
						<image
							v-for="(img, index) in post.images"
							:key="index"
							:src="img"
							mode="aspectFill"
							class="post-image"
							:class="'grid-' + (post.images.length > 3 ? 3 : post.images.length)"
							@tap="previewImage(post.images, index)"
						></image>
					</view>
				</view>

				<!-- 互动区域 -->
				<view class="post-actions">
					<view class="action-item" @tap="toggleLike(post)">
						<text class="icon" :class="post.isLiked ? 'liked' : ''">{{ post.isLiked ? '❤️' : '🤍' }}</text>
						<text class="action-text">{{ post.likeCount || '点赞' }}</text>
					</view>
					<view class="action-item" @tap="showComments(post)">
						<text class="icon">💬</text>
						<text class="action-text">{{ post.commentCount || '评论' }}</text>
					</view>
					<view class="action-item">
						<text class="icon">🔗</text>
						<text class="action-text">分享</text>
					</view>
				</view>

				<!-- 评论预览 -->
				<view class="comments-preview" v-if="post.comments && post.comments.length > 0">
					<view class="comment-item" v-for="comment in post.comments.slice(0, 2)" :key="comment.id">
						<text class="comment-user">{{ comment.username }}：</text>
						<text class="comment-text">{{ comment.content }}</text>
					</view>
					<text class="view-more" v-if="post.commentCount > 2" @tap="showComments(post)">
						查看全部 {{ post.commentCount }} 条评论
					</text>
				</view>
			</view>

			<!-- 加载提示 -->
			<view class="loading-more" v-if="loading">
				<text>加载中...</text>
			</view>
			<view class="no-more" v-if="noMore">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			postList: [],
			loading: false,
			refreshing: false,
			noMore: false,
			page: 1,
			pageSize: 10
		}
	},
	onLoad() {
		this.loadPosts()
	},
	onPullDownRefresh() {
		this.onRefresh()
	},
	methods: {
		// 加载宠物动态列表
		async loadPosts() {
			if (this.loading || this.noMore) return

			this.loading = true
			try {
				// 模拟数据 - 实际应调用云函数获取数据
				const mockData = this.getMockData()

				// 实际代码示例：
				// const res = await uniCloud.callFunction({
				// 	name: 'get_posts',
				// 	data: {
				// 		page: this.page,
				// 		pageSize: this.pageSize
				// 	}
				// })
				// this.postList = [...this.postList, ...res.result.data]

				this.postList = [...this.postList, ...mockData]

				if (mockData.length < this.pageSize) {
					this.noMore = true
				}
				this.page++
			} catch (error) {
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
			this.noMore = false
			this.postList = []
			await this.loadPosts()
			this.refreshing = false
			uni.stopPullDownRefresh()
		},

		// 加载更多
		loadMore() {
			this.loadPosts()
		},

		// 点赞/取消点赞
		async toggleLike(post) {
			post.isLiked = !post.isLiked
			post.likeCount = post.isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 1) - 1

			// 实际应调用云函数
			// await uniCloud.callFunction({
			// 	name: 'toggle_like',
			// 	data: { postId: post.id }
			// })
		},

		// 查看评论
		showComments(post) {
			// 跳转到评论详情页
			uni.navigateTo({
				url: `/pages/post-detail/index?id=${post.id}`
			})
		},

		// 预览图片
		previewImage(images, current) {
			uni.previewImage({
				urls: images,
				current: current
			})
		},

		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return ''

			const now = Date.now()
			const diff = now - timestamp

			const minute = 60 * 1000
			const hour = 60 * minute
			const day = 24 * hour

			if (diff < minute) {
				return '刚刚'
			} else if (diff < hour) {
				return Math.floor(diff / minute) + '分钟前'
			} else if (diff < day) {
				return Math.floor(diff / hour) + '小时前'
			} else if (diff < 7 * day) {
				return Math.floor(diff / day) + '天前'
			} else {
				const date = new Date(timestamp)
				return `${date.getMonth() + 1}-${date.getDate()}`
			}
		},

		// 模拟数据
		getMockData() {
			const mockPosts = [
				{
					id: '1',
					username: '爱宠人士小王',
					avatar: '/static/avatar/avatar1.png',
					content: '今天带我家狗狗去公园玩啦！看它开心的样子我也好开心😊',
					petName: '大黄',
					petType: '金毛',
					images: ['/static/demo/pet1.jpg', '/static/demo/pet2.jpg'],
					likeCount: 128,
					commentCount: 15,
					isLiked: false,
					createTime: Date.now() - 2 * 60 * 60 * 1000,
					comments: [
						{ id: 'c1', username: '宠物达人', content: '好可爱的狗狗！' },
						{ id: 'c2', username: '喵星人', content: '羡慕你们的快乐时光' }
					]
				},
				{
					id: '2',
					username: '猫咪铲屎官',
					avatar: '/static/avatar/avatar2.png',
					content: '我家猫主子今天终于肯让我摸了！感动😭',
					petName: '咪咪',
					petType: '英短',
					images: ['/static/demo/cat1.jpg'],
					likeCount: 256,
					commentCount: 32,
					isLiked: true,
					createTime: Date.now() - 5 * 60 * 60 * 1000,
					comments: [
						{ id: 'c3', username: '养猫大户', content: '太幸福了吧！' }
					]
				},
				{
					id: '3',
					username: '宠物医生李医生',
					avatar: '/static/avatar/avatar3.png',
					content: '【养宠小贴士】夏季到了，记得给宠物做好防暑降温工作哦！',
					petName: '',
					petType: '',
					images: [],
					likeCount: 89,
					commentCount: 8,
					isLiked: false,
					createTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
					comments: []
				}
			]
			return this.page === 1 ? mockPosts : []
		}
	}
}
</script>

<style lang="scss">
.pet-community {
	width: 100%;
	height: 100vh;
	background-color: #F8F8F8;
}

.post-list {
	height: 100%;
}

.post-item {
	background-color: #FFFFFF;
	margin-bottom: 20rpx;
	padding: 30rpx;
}

.post-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #E0E0E0;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;

		.username {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 8rpx;
		}

		.post-time {
			font-size: 24rpx;
			color: #999;
		}
	}
}

.post-content {
	.content-text {
		font-size: 30rpx;
		color: #333;
		line-height: 1.6;
		display: block;
		margin-bottom: 20rpx;
	}

	.pet-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-bottom: 20rpx;

		.pet-tag {
			font-size: 26rpx;
			color: #FF6B6B;
			background-color: #FFE8E8;
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
		}
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;

		.post-image {
			border-radius: 12rpx;
			background-color: #F0F0F0;

			&.grid-1 {
				width: 100%;
				height: 500rpx;
			}

			&.grid-2 {
				width: calc(50% - 5rpx);
				height: 300rpx;
			}

			&.grid-3 {
				width: calc(33.333% - 7rpx);
				height: 200rpx;
			}
		}
	}
}

.post-actions {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-top: 1rpx solid #F0F0F0;
	margin-top: 20rpx;

	.action-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;

		.icon {
			font-size: 40rpx;

			&.liked {
				animation: like-bounce 0.3s ease;
			}
		}

		.action-text {
			font-size: 28rpx;
			color: #666;
		}
	}
}

@keyframes like-bounce {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.3); }
}

.comments-preview {
	background-color: #F8F8F8;
	padding: 20rpx;
	border-radius: 12rpx;
	margin-top: 20rpx;

	.comment-item {
		font-size: 28rpx;
		line-height: 1.6;
		margin-bottom: 10rpx;

		.comment-user {
			color: #4A90E2;
			font-weight: 500;
		}

		.comment-text {
			color: #666;
		}
	}

	.view-more {
		font-size: 26rpx;
		color: #999;
		display: block;
		margin-top: 10rpx;
	}
}

.loading-more, .no-more {
	text-align: center;
	padding: 40rpx;
	font-size: 28rpx;
	color: #999;
}
</style>
