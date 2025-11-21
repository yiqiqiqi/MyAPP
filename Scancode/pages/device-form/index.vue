<template>
	<view class="publish-page">
		<scroll-view class="content" scroll-y>
			<!-- 内容输入区 -->
			<view class="input-section">
				<textarea
					class="content-input"
					v-model="postContent"
					placeholder="分享你和宠物的故事..."
					:maxlength="500"
					auto-height
				></textarea>
				<view class="char-count">{{ postContent.length }}/500</view>
			</view>

			<!-- 图片上传区 -->
			<view class="image-section">
				<text class="section-title">添加图片</text>
				<view class="image-grid">
					<!-- 已上传的图片 -->
					<view class="image-item" v-for="(img, index) in images" :key="index">
						<image :src="img" mode="aspectFill" class="uploaded-image"></image>
						<view class="delete-btn" @tap="deleteImage(index)">
							<text>×</text>
						</view>
					</view>
					<!-- 上传按钮 -->
					<view class="upload-btn" @tap="chooseImage" v-if="images.length < 9">
						<text class="upload-icon">+</text>
						<text class="upload-text">添加图片</text>
					</view>
				</view>
			</view>

			<!-- 宠物信息 -->
			<view class="pet-section">
				<text class="section-title">关联宠物</text>
				<view class="pet-selector" @tap="selectPet">
					<text v-if="selectedPet">{{ selectedPet.name }} - {{ selectedPet.type }}</text>
					<text v-else class="placeholder">选择你的宠物</text>
					<text class="arrow">→</text>
				</view>
			</view>

			<!-- 话题标签 -->
			<view class="topic-section">
				<text class="section-title">添加话题</text>
				<view class="topic-input-group">
					<input
						class="topic-input"
						v-model="topicInput"
						placeholder="输入话题标签（可选）"
						:maxlength="20"
					/>
					<button class="add-topic-btn" @tap="addTopic">添加</button>
				</view>
				<view class="topic-list" v-if="topics.length > 0">
					<view class="topic-tag" v-for="(topic, index) in topics" :key="index">
						<text>#{{ topic }}</text>
						<text class="remove-topic" @tap="removeTopic(index)">×</text>
					</view>
				</view>
			</view>

			<!-- 定位（可选） -->
			<view class="location-section">
				<text class="section-title">添加位置</text>
				<view class="location-selector" @tap="chooseLocation">
					<text v-if="location">{{ location.name }}</text>
					<text v-else class="placeholder">选择位置（可选）</text>
					<text class="arrow">→</text>
				</view>
			</view>
		</scroll-view>

		<!-- 底部发布按钮 -->
		<view class="publish-footer">
			<button class="publish-btn" @tap="publishPost" :disabled="!canPublish">
				{{ publishing ? '发布中...' : '发布' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			postContent: '',
			images: [],
			selectedPet: null,
			topics: [],
			topicInput: '',
			location: null,
			publishing: false
		}
	},
	computed: {
		canPublish() {
			return this.postContent.trim().length > 0 && !this.publishing
		}
	},
	methods: {
		// 选择图片
		chooseImage() {
			const remainCount = 9 - this.images.length
			uni.chooseImage({
				count: remainCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.uploadImages(res.tempFilePaths)
				}
			})
		},

		// 上传图片到云存储
		async uploadImages(tempFiles) {
			uni.showLoading({ title: '上传中...' })

			try {
				for (const file of tempFiles) {
					const cloudPath = `posts/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
					const uploadRes = await uniCloud.uploadFile({
						filePath: file,
						cloudPath: cloudPath
					})

					if (uploadRes.fileID) {
						const tempUrlRes = await uniCloud.getTempFileURL({
							fileList: [uploadRes.fileID]
						})
						this.images.push(tempUrlRes.fileList[0].tempFileURL)
					}
				}
				uni.hideLoading()
			} catch (error) {
				uni.hideLoading()
				uni.showToast({ title: '上传失败', icon: 'none' })
			}
		},

		// 删除图片
		deleteImage(index) {
			this.images.splice(index, 1)
		},

		// 选择宠物
		selectPet() {
			// 实际应该跳转到宠物列表页面选择
			uni.navigateTo({
				url: '/pages/select-pet/index'
			})
			// 模拟选择
			this.selectedPet = {
				id: '1',
				name: '大黄',
				type: '金毛'
			}
		},

		// 添加话题
		addTopic() {
			const topic = this.topicInput.trim()
			if (topic && this.topics.length < 5 && !this.topics.includes(topic)) {
				this.topics.push(topic)
				this.topicInput = ''
			}
		},

		// 删除话题
		removeTopic(index) {
			this.topics.splice(index, 1)
		},

		// 选择位置
		chooseLocation() {
			uni.chooseLocation({
				success: (res) => {
					this.location = {
						name: res.name,
						address: res.address,
						latitude: res.latitude,
						longitude: res.longitude
					}
				}
			})
		},

		// 发布动态
		async publishPost() {
			if (!this.canPublish) return

			this.publishing = true
			uni.showLoading({ title: '发布中...' })

			try {
				// 调用云函数发布动态
				const res = await uniCloud.callFunction({
					name: 'submit_post',
					data: {
						content: this.postContent,
						images: this.images,
						petId: this.selectedPet?.id,
						petName: this.selectedPet?.name,
						petType: this.selectedPet?.type,
						topics: this.topics,
						location: this.location
					}
				})

				if (res.result.code === 0) {
					uni.showToast({
						title: '发布成功',
						icon: 'success'
					})

					// 延迟跳转回首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 1500)
				} else {
					throw new Error(res.result.msg || '发布失败')
				}
			} catch (error) {
				uni.showToast({
					title: error.message || '发布失败',
					icon: 'none'
				})
			} finally {
				this.publishing = false
				uni.hideLoading()
			}
		}
	}
}
</script>

<style lang="scss">
.publish-page {
	width: 100%;
	height: 100vh;
	background-color: #F8F8F8;
	display: flex;
	flex-direction: column;
}

.content {
	flex: 1;
	padding: 30rpx;
}

.input-section {
	background-color: #FFFFFF;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;

	.content-input {
		width: 100%;
		min-height: 300rpx;
		font-size: 32rpx;
		line-height: 1.6;
		color: #333;
	}

	.char-count {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 20rpx;
	}
}

.image-section,
.pet-section,
.topic-section,
.location-section {
	background-color: #FFFFFF;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;

	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;

	.image-item {
		position: relative;
		width: 200rpx;
		height: 200rpx;

		.uploaded-image {
			width: 100%;
			height: 100%;
			border-radius: 12rpx;
		}

		.delete-btn {
			position: absolute;
			top: -10rpx;
			right: -10rpx;
			width: 50rpx;
			height: 50rpx;
			background-color: rgba(0, 0, 0, 0.6);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			text {
				color: #FFFFFF;
				font-size: 36rpx;
			}
		}
	}

	.upload-btn {
		width: 200rpx;
		height: 200rpx;
		border: 2rpx dashed #D0D0D0;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #F8F8F8;

		.upload-icon {
			font-size: 60rpx;
			color: #999;
		}

		.upload-text {
			font-size: 24rpx;
			color: #999;
			margin-top: 10rpx;
		}
	}
}

.pet-selector,
.location-selector {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background-color: #F8F8F8;
	border-radius: 12rpx;

	.placeholder {
		color: #999;
	}

	.arrow {
		font-size: 32rpx;
		color: #999;
	}
}

.topic-input-group {
	display: flex;
	gap: 20rpx;
	margin-bottom: 20rpx;

	.topic-input {
		flex: 1;
		padding: 20rpx;
		background-color: #F8F8F8;
		border-radius: 12rpx;
		font-size: 28rpx;
	}

	.add-topic-btn {
		padding: 20rpx 40rpx;
		background-color: #FF6B6B;
		color: #FFFFFF;
		border: none;
		border-radius: 12rpx;
		font-size: 28rpx;
	}
}

.topic-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;

	.topic-tag {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		padding: 12rpx 20rpx;
		background-color: #FFE8E8;
		color: #FF6B6B;
		border-radius: 30rpx;
		font-size: 26rpx;

		.remove-topic {
			font-size: 32rpx;
			font-weight: bold;
		}
	}
}

.publish-footer {
	background-color: #FFFFFF;
	padding: 20rpx 30rpx;
	border-top: 1rpx solid #F0F0F0;

	.publish-btn {
		width: 100%;
		padding: 28rpx;
		background-color: #FF6B6B;
		color: #FFFFFF;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: 600;

		&:disabled {
			background-color: #D0D0D0;
			color: #999;
		}
	}
}
</style>
