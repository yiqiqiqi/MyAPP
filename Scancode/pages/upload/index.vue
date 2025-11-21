<template>
	<view class="upload-page">
		<!-- 装饰背景 -->
		<view class="deco-bg">
			<view class="deco-circle circle1"></view>
			<view class="deco-circle circle2"></view>
			<view class="deco-circle circle3"></view>
		</view>

		<scroll-view class="content" scroll-y>
			<!-- 顶部欢迎卡片 -->
			<view class="welcome-card">
				<view class="welcome-header">
					<text class="welcome-icon bounce">🎨</text>
					<view class="welcome-text">
						<text class="welcome-title">分享你的萌宠时刻</text>
						<text class="welcome-subtitle">{{ isGuest ? '游客模式' : '永久保存到云端' }}</text>
					</view>
				</view>
				<view class="welcome-status" v-if="isGuest">
					<text class="status-badge">📱 临时上传</text>
					<text class="status-hint">登录后可永久保存</text>
				</view>
			</view>

			<!-- 照片选择区域 -->
			<view class="photo-section">
				<view class="section-header">
					<text class="section-icon">🌟</text>
					<text class="section-title">选择照片</text>
					<text class="section-badge">{{ selectedPhotos.length }}/9</text>
				</view>
				<view class="photo-grid">
					<!-- 已选择的照片 -->
					<view
						class="photo-item scale-in"
						v-for="(photo, index) in selectedPhotos"
						:key="index"
					>
						<image class="photo-img" :src="photo" mode="aspectFill"></image>
						<view class="photo-order">{{ index + 1 }}</view>
						<view class="photo-delete" @tap="deletePhoto(index)">
							<text class="delete-icon">×</text>
						</view>
					</view>

					<!-- 添加照片按钮 -->
					<view
						class="photo-add pulse-slow"
						@tap="choosePhoto"
						v-if="selectedPhotos.length < 9"
					>
						<view class="add-content">
							<text class="add-icon">📷</text>
							<text class="add-text">添加照片</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 描述输入区域 -->
			<view class="input-section">
				<view class="section-header">
					<text class="section-icon">💭</text>
					<text class="section-title">照片描述</text>
					<text class="section-optional">可选</text>
				</view>
				<view class="input-card">
					<textarea
						class="description-input"
						v-model="description"
						placeholder="说说这些照片的故事吧... ✨"
						:maxlength="200"
						placeholder-class="placeholder"
						auto-height
					></textarea>
					<view class="char-count">
						<text :class="{ warning: description.length >= 180 }">
							{{ description.length }}/200
						</text>
					</view>
				</view>
			</view>

			<!-- 宠物信息 -->
			<view class="pet-info-section">
				<view class="section-header">
					<text class="section-icon">🐾</text>
					<text class="section-title">宠物信息</text>
					<text class="section-optional">可选</text>
				</view>
				<view class="info-cards">
					<view class="info-card">
						<view class="info-icon">🏷️</view>
						<view class="info-content">
							<text class="info-label">宠物名字</text>
							<input
								class="info-input"
								v-model="petName"
								placeholder="例如：小白、咪咪"
								:maxlength="20"
								placeholder-class="placeholder"
							/>
						</view>
					</view>
					<view class="info-card">
						<view class="info-icon">🎭</view>
						<view class="info-content">
							<text class="info-label">宠物类型</text>
							<picker
								mode="selector"
								:range="petTypes"
								@change="onPetTypeChange"
							>
								<view class="info-input">
									<text :class="petType ? 'selected' : 'placeholder'">
										{{ petType || '点击选择' }}
									</text>
									<text class="arrow">›</text>
								</view>
							</picker>
						</view>
					</view>
				</view>
			</view>

			<!-- 上传按钮 -->
			<view class="upload-btn-wrapper">
				<button
					class="upload-btn"
					:class="{ disabled: !canUpload, uploading: uploading }"
					:disabled="!canUpload || uploading"
					@tap="handleUpload"
				>
					<view class="btn-content" v-if="!uploading">
						<text class="btn-icon">🚀</text>
						<text class="btn-text">{{ uploadBtnText }}</text>
					</view>
					<view class="btn-content" v-else>
						<view class="loading-spinner"></view>
						<text class="btn-text">上传中 {{ uploadProgress }}%</text>
					</view>
				</button>

				<!-- 游客提示 -->
				<view class="guest-tip" v-if="isGuest && selectedPhotos.length > 0">
					<text class="tip-icon">💡</text>
					<text class="tip-text">游客模式照片仅临时保存，登录可永久保存</text>
				</view>
			</view>

			<!-- 快捷操作提示 -->
			<view class="quick-tips">
				<view class="tip-item">
					<text class="tip-emoji">📸</text>
					<text class="tip-label">支持相机和相册</text>
				</view>
				<view class="tip-item">
					<text class="tip-emoji">🎨</text>
					<text class="tip-label">最多上传9张</text>
				</view>
				<view class="tip-item">
					<text class="tip-emoji">💝</text>
					<text class="tip-label">立即分享给朋友</text>
				</view>
			</view>

			<!-- 底部间距 -->
			<view class="bottom-space"></view>
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
			petTypes: ['🐱 猫咪', '🐶 狗狗', '🐰 兔子', '🐹 仓鼠', '🐦 鸟类', '🐠 鱼类', '🦎 爬行类', '🐢 乌龟', '🦜 鹦鹉', '其他'],
			uploading: false,
			uploadProgress: 0,
			isGuest: true // 是否为游客模式
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
	onLoad() {
		this.checkLoginStatus()
	},
	onShow() {
		this.checkLoginStatus()
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			const userId = uni.getStorageSync('userId')
			this.isGuest = !userId
		},

		// 选择照片
		choosePhoto() {
			const remainCount = 9 - this.selectedPhotos.length
			uni.chooseImage({
				count: remainCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.selectedPhotos.push(...res.tempFilePaths)

					// 显示选择成功提示
					uni.showToast({
						title: `已选择${res.tempFilePaths.length}张照片`,
						icon: 'success',
						duration: 1500
					})
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
				title: '确认删除',
				content: '确定要删除这张照片吗？',
				confirmColor: '#FF69B4',
				success: (res) => {
					if (res.confirm) {
						this.selectedPhotos.splice(index, 1)
						uni.showToast({
							title: '已删除',
							icon: 'success',
							duration: 1000
						})
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

			const userId = uni.getStorageSync('userId')

			// 游客模式 - 保存到本地
			if (!userId) {
				await this.handleGuestUpload()
			} else {
				// 登录模式 - 上传到云端
				await this.handleCloudUpload(userId)
			}
		},

		// 游客模式上传（保存到本地）
		async handleGuestUpload() {
			try {
				this.uploading = true
				this.uploadProgress = 50

				// 模拟上传进度
				setTimeout(() => {
					this.uploadProgress = 100
				}, 300)

				// 准备照片数据
				const guestPhotos = uni.getStorageSync('guestPhotos') || []
				const newPhotos = this.selectedPhotos.map((photo, index) => ({
					id: `guest_${Date.now()}_${index}`,
					url: photo,
					description: this.description.trim(),
					petName: this.petName.trim(),
					petType: this.petType,
					createTime: Date.now()
				}))

				// 保存到本地存储
				guestPhotos.push(...newPhotos)
				uni.setStorageSync('guestPhotos', guestPhotos)

				// 延迟显示成功
				setTimeout(() => {
					uni.showToast({
						title: '临时保存成功！',
						icon: 'success',
						duration: 2000
					})

					// 重置表单并跳转
					setTimeout(() => {
						this.resetForm()
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 2000)
				}, 600)

			} catch (error) {
				console.error('临时保存失败', error)
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				})
			} finally {
				setTimeout(() => {
					this.uploading = false
					this.uploadProgress = 0
				}, 2600)
			}
		},

		// 云端上传（登录模式）
		async handleCloudUpload(userId) {
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
						this.resetForm()
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
					showCancel: false,
					confirmColor: '#FF69B4'
				})
			} finally {
				this.uploading = false
			}
		},

		// 重置表单
		resetForm() {
			this.selectedPhotos = []
			this.description = ''
			this.petName = ''
			this.petType = ''
			this.uploadProgress = 0
		}
	}
}
</script>

<style lang="scss">
.upload-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 50%, #FFF5F7 100%);
	position: relative;
	overflow: hidden;
}

/* 装饰背景 */
.deco-bg {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 0;
	pointer-events: none;

	.deco-circle {
		position: absolute;
		border-radius: 50%;
		opacity: 0.05;
	}

	.circle1 {
		width: 400rpx;
		height: 400rpx;
		background: #FFB6C1;
		top: -100rpx;
		right: -100rpx;
	}

	.circle2 {
		width: 300rpx;
		height: 300rpx;
		background: #FF69B4;
		bottom: 200rpx;
		left: -80rpx;
	}

	.circle3 {
		width: 200rpx;
		height: 200rpx;
		background: #FFB6C1;
		top: 50%;
		right: -50rpx;
	}
}

.content {
	position: relative;
	z-index: 1;
	height: 100vh;
	padding: 30rpx;
	box-sizing: border-box;
}

/* 欢迎卡片 */
.welcome-card {
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);

	.welcome-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.welcome-icon {
			font-size: 80rpx;
			margin-right: 25rpx;
		}

		.welcome-text {
			flex: 1;
			display: flex;
			flex-direction: column;

			.welcome-title {
				font-size: 36rpx;
				font-weight: 700;
				color: #FF69B4;
				margin-bottom: 8rpx;
			}

			.welcome-subtitle {
				font-size: 26rpx;
				color: #999;
			}
		}
	}

	.welcome-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 25rpx;
		background: linear-gradient(135deg, #FFE8EE 0%, #FFF5F7 100%);
		border-radius: 20rpx;
		border: 2rpx dashed #FFB6C1;

		.status-badge {
			font-size: 26rpx;
			color: #FF69B4;
			font-weight: 600;
		}

		.status-hint {
			font-size: 24rpx;
			color: #FFB6C1;
		}
	}
}

/* 动画 */
.bounce {
	animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10rpx);
	}
}

/* 区块样式 */
.photo-section,
.input-section,
.pet-info-section {
	margin-bottom: 30rpx;
}

.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 25rpx;

	.section-icon {
		font-size: 40rpx;
		margin-right: 15rpx;
	}

	.section-title {
		flex: 1;
		font-size: 32rpx;
		font-weight: 700;
		color: #FF69B4;
	}

	.section-badge {
		font-size: 26rpx;
		color: #FF69B4;
		background: rgba(255, 182, 193, 0.2);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-weight: 600;
	}

	.section-optional {
		font-size: 24rpx;
		color: #FFB6C1;
		padding: 6rpx 15rpx;
		background: rgba(255, 182, 193, 0.15);
		border-radius: 15rpx;
	}
}

/* 照片网格 */
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
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.2);

		.photo-img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.photo-order {
			position: absolute;
			top: 15rpx;
			left: 15rpx;
			width: 45rpx;
			height: 45rpx;
			background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			color: #FFFFFF;
			font-weight: 700;
			box-shadow: 0 4rpx 12rpx rgba(255, 105, 180, 0.4);
		}

		.photo-delete {
			position: absolute;
			top: 15rpx;
			right: 15rpx;
			width: 50rpx;
			height: 50rpx;
			background: rgba(0, 0, 0, 0.7);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10rpx);

			.delete-icon {
				font-size: 40rpx;
				color: #FFFFFF;
				font-weight: 300;
				line-height: 1;
			}
		}
	}

	.photo-add {
		width: 100%;
		padding-bottom: 100%;
		position: relative;
		border: 3rpx dashed #FFB6C1;
		border-radius: 25rpx;
		background: linear-gradient(135deg, rgba(255, 232, 238, 0.3), rgba(255, 245, 247, 0.5));
		overflow: hidden;

		.add-content {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: flex;
			flex-direction: column;
			align-items: center;

			.add-icon {
				font-size: 60rpx;
				margin-bottom: 10rpx;
			}

			.add-text {
				font-size: 24rpx;
				color: #FFB6C1;
				font-weight: 600;
			}
		}
	}
}

.scale-in {
	animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
	from {
		transform: scale(0);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

.pulse-slow {
	animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
	0%, 100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.02);
		opacity: 0.9;
	}
}

/* 输入卡片 */
.input-card {
	background: #FFFFFF;
	border-radius: 25rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

	.description-input {
		width: 100%;
		min-height: 180rpx;
		font-size: 30rpx;
		color: #333;
		line-height: 1.6;
	}

	.placeholder {
		color: #CCC;
	}

	.char-count {
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 15rpx;
		padding-top: 15rpx;
		border-top: 1rpx solid #F5F5F5;

		.warning {
			color: #FF69B4;
			font-weight: 600;
		}
	}
}

/* 宠物信息卡片 */
.info-cards {
	display: flex;
	flex-direction: column;
	gap: 20rpx;

	.info-card {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: #FFFFFF;
		border-radius: 25rpx;
		box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

		.info-icon {
			font-size: 50rpx;
			margin-right: 25rpx;
		}

		.info-content {
			flex: 1;
			display: flex;
			flex-direction: column;

			.info-label {
				font-size: 26rpx;
				color: #999;
				margin-bottom: 12rpx;
			}

			.info-input {
				font-size: 30rpx;
				color: #333;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.placeholder {
					color: #CCC;
				}

				.selected {
					color: #333;
				}

				.arrow {
					font-size: 40rpx;
					color: #FFB6C1;
					margin-left: 20rpx;
				}
			}
		}
	}
}

/* 上传按钮 */
.upload-btn-wrapper {
	margin: 50rpx 0 30rpx;

	.upload-btn {
		width: 100%;
		height: 110rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 55rpx;
		font-size: 36rpx;
		font-weight: 700;
		box-shadow: 0 12rpx 35rpx rgba(255, 105, 180, 0.5);
		transition: all 0.3s;
		overflow: hidden;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 0;
			height: 0;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.3);
			transform: translate(-50%, -50%);
			transition: width 0.6s, height 0.6s;
		}

		&:active:not(.disabled):not(.uploading)::before {
			width: 600rpx;
			height: 600rpx;
		}

		&.disabled {
			background: linear-gradient(135deg, #DDD, #CCC);
			color: #999;
			box-shadow: none;
		}

		&.uploading {
			background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		}

		.btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 15rpx;

			.btn-icon {
				font-size: 40rpx;
			}

			.btn-text {
				font-size: 32rpx;
			}

			.loading-spinner {
				width: 40rpx;
				height: 40rpx;
				border: 4rpx solid rgba(255, 255, 255, 0.3);
				border-top-color: #FFFFFF;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
		}
	}

	.guest-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 25rpx;
		padding: 20rpx 30rpx;
		background: linear-gradient(135deg, #FFE8EE 0%, #FFF5F7 100%);
		border-radius: 20rpx;
		border: 2rpx dashed #FFB6C1;

		.tip-icon {
			font-size: 32rpx;
			margin-right: 12rpx;
		}

		.tip-text {
			font-size: 24rpx;
			color: #FF69B4;
		}
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* 快捷提示 */
.quick-tips {
	display: flex;
	justify-content: space-between;
	padding: 30rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

	.tip-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;

		.tip-emoji {
			font-size: 40rpx;
		}

		.tip-label {
			font-size: 22rpx;
			color: #999;
			text-align: center;
		}
	}
}

.bottom-space {
	height: 60rpx;
}
</style>
