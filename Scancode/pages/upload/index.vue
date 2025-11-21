<template>
	<view class="upload-page">
		<scroll-view class="content" scroll-y>
			<!-- 顶部提示卡片 -->
			<view class="tip-card">
				<text class="tip-icon">📸</text>
				<view class="tip-content">
					<text class="tip-title">分享你的萌宠时刻</text>
					<text class="tip-text">最多可上传9张照片哦~</text>
				</view>
			</view>

			<!-- 照片选择区域 -->
			<view class="photo-section">
				<view class="section-title">
					<text>🌟 选择照片</text>
				</view>
				<view class="photo-grid">
					<!-- 已选择的照片 -->
					<view
						class="photo-item"
						v-for="(photo, index) in selectedPhotos"
						:key="index"
					>
						<image class="photo-img" :src="photo" mode="aspectFill"></image>
						<view class="photo-delete" @tap="deletePhoto(index)">
							<text class="delete-icon">×</text>
						</view>
					</view>

					<!-- 添加照片按钮 -->
					<view
						class="photo-add"
						@tap="choosePhoto"
						v-if="selectedPhotos.length < 9"
					>
						<text class="add-icon">+</text>
						<text class="add-text">添加照片</text>
					</view>
				</view>
				<view class="photo-count">
					<text>已选择 {{ selectedPhotos.length }}/9 张</text>
				</view>
			</view>

			<!-- 描述输入区域 -->
			<view class="description-section">
				<view class="section-title">
					<text>💭 添加描述（可选）</text>
				</view>
				<textarea
					class="description-input"
					v-model="description"
					placeholder="说说这些照片的故事吧..."
					:maxlength="200"
					placeholder-class="placeholder"
				></textarea>
				<view class="char-count">
					<text>{{ description.length }}/200</text>
				</view>
			</view>

			<!-- 宠物信息（可选） -->
			<view class="pet-info-section">
				<view class="section-title">
					<text>🐾 宠物信息（可选）</text>
				</view>
				<view class="info-item">
					<text class="info-label">宠物名字</text>
					<input
						class="info-input"
						v-model="petName"
						placeholder="例如：小白"
						:maxlength="20"
					/>
				</view>
				<view class="info-item">
					<text class="info-label">宠物类型</text>
					<picker
						mode="selector"
						:range="petTypes"
						@change="onPetTypeChange"
					>
						<view class="info-input picker">
							<text :class="petType ? '' : 'placeholder'">
								{{ petType || '请选择' }}
							</text>
						</view>
					</picker>
				</view>
			</view>

			<!-- 上传按钮 -->
			<view class="upload-btn-wrapper">
				<button
					class="upload-btn"
					:class="{ disabled: !canUpload }"
					:disabled="!canUpload || uploading"
					@tap="handleUpload"
				>
					<text v-if="!uploading">{{ uploadBtnText }}</text>
					<text v-else>上传中... {{ uploadProgress }}%</text>
				</button>
			</view>

			<!-- 底部提示 -->
			<view class="bottom-tip">
				<text class="tip-emoji">💡</text>
				<text class="tip-desc">上传的照片会在「我的相册」中展示</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			selectedPhotos: [],
			description: '',
			petName: '',
			petType: '',
			petTypes: ['🐱 猫咪', '🐶 狗狗', '🐰 兔子', '🐹 仓鼠', '🐦 鸟类', '🐠 鱼类', '🦎 爬行类', '其他'],
			uploading: false,
			uploadProgress: 0
		}
	},
	computed: {
		canUpload() {
			return this.selectedPhotos.length > 0
		},
		uploadBtnText() {
			if (this.selectedPhotos.length === 0) {
				return '请先选择照片'
			}
			return `上传 ${this.selectedPhotos.length} 张照片`
		}
	},
	methods: {
		// 选择照片
		choosePhoto() {
			const remainCount = 9 - this.selectedPhotos.length
			uni.chooseImage({
				count: remainCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.selectedPhotos.push(...res.tempFilePaths)
				},
				fail: (err) => {
					console.error('选择照片失败', err)
					uni.showToast({
						title: '选择照片失败',
						icon: 'none'
					})
				}
			})
		},

		// 删除照片
		deletePhoto(index) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这张照片吗？',
				success: (res) => {
					if (res.confirm) {
						this.selectedPhotos.splice(index, 1)
					}
				}
			})
		},

		// 宠物类型选择
		onPetTypeChange(e) {
			this.petType = this.petTypes[e.detail.value]
		},

		// 上传照片
		async handleUpload() {
			if (!this.canUpload || this.uploading) return

			// 检查登录
			const userId = uni.getStorageSync('userId')
			if (!userId) {
				uni.showModal({
					title: '提示',
					content: '请先登录',
					success: (res) => {
						if (res.confirm) {
							uni.switchTab({
								url: '/pages/index/index'
							})
						}
					}
				})
				return
			}

			this.uploading = true
			this.uploadProgress = 0

			try {
				uni.showLoading({
					title: '上传中...',
					mask: true
				})

				const uploadedUrls = []
				const total = this.selectedPhotos.length

				// 逐个上传照片
				for (let i = 0; i < this.selectedPhotos.length; i++) {
					const photo = this.selectedPhotos[i]

					// 生成唯一文件名
					const timestamp = Date.now()
					const random = Math.random().toString(36).substr(2, 9)
					const ext = photo.split('.').pop()
					const cloudPath = `pet-photos/${userId}/${timestamp}_${random}.${ext}`

					// 上传到云存储
					const uploadRes = await uniCloud.uploadFile({
						filePath: photo,
						cloudPath: cloudPath
					})

					if (uploadRes.fileID) {
						// 获取临时URL
						const tempUrlRes = await uniCloud.getTempFileURL({
							fileList: [uploadRes.fileID]
						})

						if (tempUrlRes.fileList && tempUrlRes.fileList[0]) {
							uploadedUrls.push({
								fileID: uploadRes.fileID,
								url: tempUrlRes.fileList[0].tempFileURL
							})
						}
					}

					// 更新进度
					this.uploadProgress = Math.floor(((i + 1) / total) * 100)
				}

				// 保存到数据库
				const result = await uniCloud.callFunction({
					name: 'upload-photos',
					data: {
						userId: userId,
						photos: uploadedUrls,
						description: this.description.trim(),
						petName: this.petName.trim(),
						petType: this.petType
					}
				})

				uni.hideLoading()

				if (result.result.code === 0) {
					uni.showToast({
						title: '上传成功！',
						icon: 'success',
						duration: 2000
					})

					// 延迟后跳转到首页
					setTimeout(() => {
						// 重置表单
						this.selectedPhotos = []
						this.description = ''
						this.petName = ''
						this.petType = ''
						this.uploadProgress = 0

						// 跳转到首页
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 2000)
				} else {
					throw new Error(result.result.msg || '上传失败')
				}

			} catch (error) {
				console.error('上传失败', error)
				uni.hideLoading()
				uni.showModal({
					title: '上传失败',
					content: error.message || '请稍后重试',
					showCancel: false
				})
			} finally {
				this.uploading = false
			}
		}
	}
}
</script>

<style lang="scss">
.upload-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 100%);
}

.content {
	height: 100vh;
	padding: 30rpx;
	box-sizing: border-box;
}

/* 顶部提示卡片 */
.tip-card {
	display: flex;
	align-items: center;
	padding: 30rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.15);
	margin-bottom: 30rpx;

	.tip-icon {
		font-size: 60rpx;
		margin-right: 20rpx;
	}

	.tip-content {
		flex: 1;
		display: flex;
		flex-direction: column;

		.tip-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #FF69B4;
			margin-bottom: 8rpx;
		}

		.tip-text {
			font-size: 26rpx;
			color: #999;
		}
	}
}

/* 照片选择区域 */
.photo-section {
	margin-bottom: 30rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF69B4;
		margin-bottom: 20rpx;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		margin-bottom: 20rpx;

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

			.photo-delete {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				width: 50rpx;
				height: 50rpx;
				background: rgba(0, 0, 0, 0.6);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.delete-icon {
					font-size: 40rpx;
					color: #FFFFFF;
					font-weight: 300;
				}
			}
		}

		.photo-add {
			width: 100%;
			padding-bottom: 100%;
			position: relative;
			border: 3rpx dashed #FFB6C1;
			border-radius: 20rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background: rgba(255, 182, 193, 0.1);

			.add-icon {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -70%);
				font-size: 60rpx;
				color: #FFB6C1;
			}

			.add-text {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, 30%);
				font-size: 24rpx;
				color: #FFB6C1;
			}
		}
	}

	.photo-count {
		text-align: center;
		font-size: 26rpx;
		color: #999;
	}
}

/* 描述输入区域 */
.description-section {
	margin-bottom: 30rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF69B4;
		margin-bottom: 20rpx;
	}

	.description-input {
		width: 100%;
		min-height: 200rpx;
		padding: 30rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		font-size: 30rpx;
		color: #333;
		box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.1);
		box-sizing: border-box;
	}

	.placeholder {
		color: #CCC;
	}

	.char-count {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}
}

/* 宠物信息 */
.pet-info-section {
	margin-bottom: 30rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF69B4;
		margin-bottom: 20rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 15rpx rgba(255, 105, 180, 0.1);

		.info-label {
			width: 160rpx;
			font-size: 30rpx;
			color: #666;
		}

		.info-input {
			flex: 1;
			font-size: 30rpx;
			color: #333;

			&.picker {
				.placeholder {
					color: #CCC;
				}
			}
		}
	}
}

/* 上传按钮 */
.upload-btn-wrapper {
	margin: 40rpx 0;

	.upload-btn {
		width: 100%;
		height: 100rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 50rpx;
		font-size: 36rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.4);
		transition: all 0.3s;

		&.disabled {
			background: #DDD;
			color: #999;
			box-shadow: none;
		}

		&:active:not(.disabled) {
			transform: scale(0.98);
		}
	}
}

/* 底部提示 */
.bottom-tip {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx;

	.tip-emoji {
		font-size: 32rpx;
		margin-right: 10rpx;
	}

	.tip-desc {
		font-size: 26rpx;
		color: #999;
	}
}
</style>
