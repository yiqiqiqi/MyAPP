<template>
	<view class="my-album-page">
		<!-- 波浪装饰 -->
		<view class="wave-decoration">
			<view class="wave wave1"></view>
			<view class="wave wave2"></view>
		</view>

		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-content">
				<text class="navbar-title">🐾 我的相册</text>
			</view>
		</view>

		<scroll-view
			class="content"
			scroll-y
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMorePhotos"
		>
			<!-- 用户信息卡片 -->
			<view class="user-card" v-if="userInfo">
				<view class="user-header">
					<view class="user-avatar-wrapper">
						<image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
						<view class="avatar-badge">✨</view>
					</view>
					<view class="user-info">
						<text class="user-name">{{ userInfo.nickName }}</text>
						<text class="user-stats">📷 已上传 {{ photoCount }} 张</text>
					</view>
				</view>
			</view>

			<!-- 游客提示卡片 -->
			<view class="guest-card" v-else>
				<text class="guest-icon">🎉</text>
				<text class="guest-title">欢迎使用宠物相册</text>
				<text class="guest-subtitle">登录后永久保存照片</text>
				<button class="login-btn" @tap="handleLogin">
					<text class="btn-icon">✨</text>
					<text>微信登录</text>
				</button>
			</view>

			<!-- 快速上传区域 -->
			<view class="upload-section">
				<view class="section-header">
					<text class="section-icon">📸</text>
					<text class="section-title">快速上传</text>
				</view>

				<!-- 照片选择网格 -->
				<view class="photo-grid">
					<view
						class="photo-item"
						v-for="(photo, index) in selectedPhotos"
						:key="index"
					>
						<image class="photo-img" :src="photo" mode="aspectFill"></image>
						<view class="photo-delete" @tap="deletePhoto(index)">×</view>
					</view>

					<!-- 添加按钮 -->
					<view
						class="photo-add"
						@tap="choosePhoto"
						v-if="selectedPhotos.length < 9"
					>
						<text class="add-icon">+</text>
						<text class="add-text">添加</text>
					</view>
				</view>

				<!-- 描述输入 -->
				<view class="input-box" v-if="selectedPhotos.length > 0">
					<textarea
						class="desc-input"
						v-model="description"
						placeholder="说说你的宠物吧... ✨"
						:maxlength="200"
						placeholder-class="placeholder"
					></textarea>
					<view class="input-footer">
						<text class="char-count">{{ description.length }}/200</text>
						<button
							class="upload-btn"
							:class="{ uploading: uploading }"
							:disabled="uploading"
							@tap="handleUpload"
						>
							<text class="btn-icon" v-if="!uploading">🚀</text>
							<view class="btn-loading" v-if="uploading">
								<view class="loading-spinner"></view>
							</view>
							<text>{{ uploading ? '上传中...' : '发布' }}</text>
						</button>
					</view>
					<!-- 上传进度条 -->
					<view class="upload-progress-bar" v-if="uploading && uploadProgress > 0">
						<view class="progress-fill" :style="{ width: uploadProgress + '%' }"></view>
						<text class="progress-text">{{ uploadProgress }}%</text>
					</view>
				</view>
			</view>

			<!-- 骨架屏加载 -->
			<view class="history-section" v-if="loading">
				<view class="section-header">
					<text class="section-icon">🌈</text>
					<text class="section-title">加载中...</text>
				</view>
				<view class="photo-waterfall">
					<view class="skeleton-item" v-for="n in 6" :key="'skeleton-' + n">
						<view class="skeleton-img skeleton-animation"></view>
						<view class="skeleton-text skeleton-animation"></view>
					</view>
				</view>
			</view>

			<!-- 我的照片历史 -->
			<view class="history-section" v-if="!loading && displayPhotos.length > 0">
				<view class="section-header">
					<text class="section-icon">🌈</text>
					<text class="section-title">
						{{ userInfo ? '我的照片' : '临时照片' }}
					</text>
					<text class="photo-badge" v-if="!userInfo">{{ displayPhotos.length }}</text>
				</view>

				<view class="photo-waterfall">
					<view
						class="history-photo-item fade-in-up"
						v-for="(photo, index) in displayPhotos"
						:key="photo.id || photo._id"
						@tap="previewPhoto(index)"
					>
						<image class="history-photo-img" :src="photo.url" mode="widthFix" lazy-load></image>
						<view class="photo-overlay">
							<view class="photo-info">
								<text class="photo-desc" v-if="photo.description">
									{{ photo.description }}
								</text>
								<text class="photo-date">{{ formatDate(photo.createTime) }}</text>
							</view>
							<view class="photo-badge-temp" v-if="!userInfo">临时</view>
						</view>
						<!-- 新增：长按菜单触发 -->
						<view class="photo-actions" @longpress="showPhotoMenu(index)">
							<view class="action-dot"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="userInfo && hasMore && photos.length > 0 && !loading">
				<view class="loading-spinner" v-if="loadingMore"></view>
				<text class="load-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
			</view>

			<!-- 没有更多 -->
			<view class="no-more" v-if="userInfo && !hasMore && photos.length > 0 && !loading">
				<text class="no-more-text">🌸 已经到底啦 🌸</text>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="!loading && displayPhotos.length === 0">
				<view class="empty-animation">
					<text class="empty-icon pulse">📸</text>
					<view class="empty-circle circle-1"></view>
					<view class="empty-circle circle-2"></view>
					<view class="empty-circle circle-3"></view>
				</view>
				<text class="empty-text">还没有照片哦</text>
				<text class="empty-hint">快点击上方添加按钮上传吧~</text>
				<text class="empty-tip">💡 小提示：最多可以一次上传9张照片</text>
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
			userInfo: null,
			photos: [], // 云端照片
			guestPhotos: [], // 游客照片
			photoCount: 0,
			refreshing: false,
			loading: false, // 新增：加载状态

			// 分页相关
			page: 1,
			pageSize: 20,
			hasMore: true,
			loadingMore: false,

			// 上传相关
			selectedPhotos: [],
			description: '',
			uploading: false,
			uploadProgress: 0 // 新增：上传进度
		}
	},
	computed: {
		displayPhotos() {
			return this.userInfo ? this.photos : this.guestPhotos
		}
	},
	onLoad() {
		this.checkLogin()
	},
	onShow() {
		if (this.userInfo) {
			this.loadPhotos()
		} else {
			this.loadLocalPhotos()
		}
	},
	methods: {
		// 检查登录状态
		async checkLogin() {
			try {
				const userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					this.userInfo = userInfo
					await this.loadPhotos()
					await this.migrateGuestPhotos()
				} else {
					this.loadLocalPhotos()
				}
			} catch (e) {
				console.error('检查登录失败', e)
			}
		},

		// 微信登录
		async handleLogin() {
			try {
				// 1. 获取用户信息授权
				const userProfile = await new Promise((resolve, reject) => {
					uni.getUserProfile({
						desc: '用于展示个人信息',
						lang: 'zh_CN',
						success: (res) => resolve(res),
						fail: (err) => reject(err)
					})
				})

				// 2. 调用微信登录获取 code
				const loginResult = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => resolve(res),
						fail: (err) => reject(err)
					})
				})

				if (!loginResult.code) {
					uni.showToast({
						title: '登录失败，请重试',
						icon: 'none'
					})
					return
				}

				// 3. 调用云函数进行登录
				const result = await uniCloud.callFunction({
					name: 'user-login',
					data: {
						code: loginResult.code,
						userInfo: userProfile.userInfo
					}
				})

				if (result.result.code === 0) {
					this.userInfo = result.result.data.userInfo
					uni.setStorageSync('userInfo', this.userInfo)
					uni.setStorageSync('userId', result.result.data.userId)

					uni.showToast({
						title: '登录成功 ✨',
						icon: 'success'
					})

					// 加载云端照片并迁移游客照片
					await this.loadPhotos()
					await this.migrateGuestPhotos()
				} else {
					uni.showToast({
						title: result.result.msg || '登录失败',
						icon: 'none'
					})
				}
			} catch (e) {
				console.error('登录失败', e)
				if (e.errMsg && e.errMsg.includes('cancel')) {
					uni.showToast({
						title: '登录已取消',
						icon: 'none'
					})
				} else {
					uni.showToast({
						title: '登录失败，请重试',
						icon: 'none'
					})
				}
			}
		},

		// 加载云端照片
		async loadPhotos(isRefresh = false) {
			if (isRefresh) {
				this.loading = true
			} else {
				this.loadingMore = true
			}

			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) return

				const res = await uniCloud.callFunction({
					name: 'get-photos',
					data: {
						userId,
						page: isRefresh ? 1 : this.page,
						pageSize: this.pageSize
					}
				})

				if (res.result.code === 0) {
					const newPhotos = res.result.data.photos || []

					if (isRefresh) {
						this.photos = newPhotos
						this.page = 1
					} else {
						this.photos.push(...newPhotos)
					}

					this.photoCount = res.result.data.total || this.photos.length
					this.hasMore = newPhotos.length === this.pageSize
				}
			} catch (e) {
				console.error('加载照片失败', e)
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
				this.loadingMore = false
			}
		},

		// 加载更多照片
		loadMorePhotos() {
			if (!this.userInfo || !this.hasMore || this.loadingMore || this.loading) {
				return
			}

			this.page++
			this.loadPhotos(false)
		},

		// 加载本地照片
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

		// 迁移游客照片
		async migrateGuestPhotos() {
			try {
				const guestPhotos = uni.getStorageSync('guestPhotos')
				if (!guestPhotos || guestPhotos.length === 0) return

				const [error, res] = await uni.showModal({
					title: '发现临时照片',
					content: `检测到 ${guestPhotos.length} 张临时照片，是否保存到云端？`,
					confirmText: '保存',
					cancelText: '删除'
				})

				if (res.confirm) {
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
						title: '照片已保存',
						icon: 'success'
					})

					uni.removeStorageSync('guestPhotos')
					this.guestPhotos = []
					await this.loadPhotos()
				} else {
					uni.removeStorageSync('guestPhotos')
					this.guestPhotos = []
				}
			} catch (e) {
				console.error('迁移照片失败', e)
			}
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
				}
			})
		},

		// 删除照片
		deletePhoto(index) {
			this.selectedPhotos.splice(index, 1)
		},

		// 上传照片
		async handleUpload() {
			if (this.uploading || this.selectedPhotos.length === 0) return

			const userId = uni.getStorageSync('userId')

			if (!userId) {
				// 游客模式
				await this.handleGuestUpload()
			} else {
				// 登录模式
				await this.handleCloudUpload(userId)
			}
		},

		// 游客上传
		async handleGuestUpload() {
			try {
				this.uploading = true

				const guestPhotos = uni.getStorageSync('guestPhotos') || []
				const newPhotos = this.selectedPhotos.map((photo, index) => ({
					id: `guest_${Date.now()}_${index}`,
					url: photo,
					description: this.description.trim(),
					createTime: Date.now()
				}))

				guestPhotos.unshift(...newPhotos)
				uni.setStorageSync('guestPhotos', guestPhotos)

				uni.showToast({
					title: '临时保存成功',
					icon: 'success'
				})

				this.selectedPhotos = []
				this.description = ''
				this.loadLocalPhotos()
			} catch (error) {
				console.error('保存失败', error)
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				})
			} finally {
				this.uploading = false
			}
		},

		// 云端上传
		async handleCloudUpload(userId) {
			this.uploading = true
			this.uploadProgress = 0

			try {
				uni.showLoading({ title: '上传中...', mask: true })

				const uploadedUrls = []
				const total = this.selectedPhotos.length

				for (let i = 0; i < this.selectedPhotos.length; i++) {
					const photo = this.selectedPhotos[i]

					// 更新进度
					this.uploadProgress = Math.floor(((i + 0.5) / total) * 100)

					// 压缩图片
					const compressedPath = await this.compressImage(photo)

					const timestamp = Date.now()
					const random = Math.random().toString(36).substr(2, 9)
					const ext = compressedPath.split('.').pop()
					const cloudPath = `pet-photos/${userId}/${timestamp}_${random}.${ext}`

					const uploadRes = await uniCloud.uploadFile({
						filePath: compressedPath,
						cloudPath: cloudPath
					})

					if (uploadRes.fileID) {
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

				const result = await uniCloud.callFunction({
					name: 'upload-photos',
					data: {
						userId: userId,
						photos: uploadedUrls,
						description: this.description.trim(),
						petName: '',
						petType: ''
					}
				})

				uni.hideLoading()

				if (result.result.code === 0) {
					uni.showToast({
						title: '发布成功！',
						icon: 'success'
					})

					this.selectedPhotos = []
					this.description = ''
					this.uploadProgress = 0
					this.page = 1
					await this.loadPhotos(true)
				}
			} catch (error) {
				console.error('上传失败', error)
				uni.hideLoading()
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				})
			} finally {
				this.uploading = false
				this.uploadProgress = 0
			}
		},

		// 压缩图片
		async compressImage(filePath) {
			return new Promise((resolve, reject) => {
				uni.compressImage({
					src: filePath,
					quality: 80,
					compressedWidth: 1200,
					success: (res) => {
						resolve(res.tempFilePath)
					},
					fail: (err) => {
						console.warn('图片压缩失败，使用原图', err)
						resolve(filePath)
					}
				})
			})
		},

		// 下拉刷新
		async onRefresh() {
			this.refreshing = true
			this.page = 1
			if (this.userInfo) {
				await this.loadPhotos(true)
			} else {
				this.loadLocalPhotos()
			}
			this.refreshing = false
		},

		// 预览照片
		previewPhoto(index) {
			const urls = this.displayPhotos.map(p => p.url)
			uni.previewImage({
				urls,
				current: index
			})
		},

		// 格式化日期
		formatDate(timestamp) {
			const date = new Date(timestamp)
			const month = date.getMonth() + 1
			const day = date.getDate()
			const hour = date.getHours()
			const minute = date.getMinutes()
			return `${month}/${day} ${hour}:${minute < 10 ? '0' + minute : minute}`
		},

		// 显示照片菜单
		showPhotoMenu(index) {
			const photo = this.displayPhotos[index]
			uni.showActionSheet({
				itemList: ['查看大图', '分享', '删除'],
				itemColor: '#FF69B4',
				success: (res) => {
					if (res.tapIndex === 0) {
						this.previewPhoto(index)
					} else if (res.tapIndex === 1) {
						this.sharePhoto(photo)
					} else if (res.tapIndex === 2) {
						this.deletePhotoConfirm(index)
					}
				}
			})
		},

		// 分享照片
		sharePhoto(photo) {
			uni.showShareMenu({
				withShareTicket: true
			})
			uni.showToast({
				title: '点击右上角分享',
				icon: 'none'
			})
		},

		// 删除照片确认
		deletePhotoConfirm(index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这张照片吗？',
				confirmColor: '#FF69B4',
				success: (res) => {
					if (res.confirm) {
						this.deletePhotoItem(index)
					}
				}
			})
		},

		// 删除照片
		async deletePhotoItem(index) {
			try {
				if (this.userInfo) {
					// 云端照片删除
					this.photos.splice(index, 1)
					this.photoCount = this.photos.length
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				} else {
					// 本地照片删除
					this.guestPhotos.splice(index, 1)
					uni.setStorageSync('guestPhotos', this.guestPhotos)
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				}
			} catch (e) {
				console.error('删除失败', e)
				uni.showToast({
					title: '删除失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style lang="scss">
.my-album-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 50%, #FFF5F7 100%);
	position: relative;
}

/* 波浪装饰 */
.wave-decoration {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 250rpx;
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

/* 导航栏 */
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
		padding: 0 30rpx;

		.navbar-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #FFFFFF;
			text-shadow: 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.1);
		}
	}
}

.content {
	position: relative;
	z-index: 1;
	padding-top: calc(var(--status-bar-height) + 100rpx);
	height: 100vh;
	box-sizing: border-box;
	padding-left: 30rpx;
	padding-right: 30rpx;
}

/* 用户卡片 */
.user-card {
	margin-bottom: 30rpx;
	padding: 30rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);

	.user-header {
		display: flex;
		align-items: center;

		.user-avatar-wrapper {
			position: relative;
			margin-right: 25rpx;

			.user-avatar {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				border: 5rpx solid #FFB6C1;
			}

			.avatar-badge {
				position: absolute;
				bottom: -5rpx;
				right: -5rpx;
				font-size: 35rpx;
			}
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 32rpx;
				font-weight: 700;
				color: #FF69B4;
				margin-bottom: 8rpx;
			}

			.user-stats {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

/* 游客卡片 */
.guest-card {
	margin-bottom: 30rpx;
	padding: 50rpx 30rpx;
	background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
	border-radius: 30rpx;
	box-shadow: 0 12rpx 40rpx rgba(255, 105, 180, 0.2);
	display: flex;
	flex-direction: column;
	align-items: center;

	.guest-icon {
		font-size: 100rpx;
		margin-bottom: 20rpx;
	}

	.guest-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #FF69B4;
		margin-bottom: 10rpx;
	}

	.guest-subtitle {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.login-btn {
		width: 400rpx;
		height: 85rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 45rpx;
		font-size: 30rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(255, 105, 180, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;

		.btn-icon {
			font-size: 32rpx;
		}
	}
}

/* 上传区域 */
.upload-section {
	margin-bottom: 30rpx;
}

.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 25rpx;

	.section-icon {
		font-size: 36rpx;
		margin-right: 12rpx;
	}

	.section-title {
		flex: 1;
		font-size: 32rpx;
		font-weight: 700;
		color: #FF69B4;
	}

	.photo-badge {
		font-size: 24rpx;
		color: #FF69B4;
		background: rgba(255, 182, 193, 0.2);
		padding: 6rpx 16rpx;
		border-radius: 15rpx;
	}
}

.photo-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 15rpx;
	margin-bottom: 20rpx;

	.photo-item {
		position: relative;
		width: 100%;
		padding-bottom: 100%;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.2);

		.photo-img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.photo-delete {
			position: absolute;
			top: 8rpx;
			right: 8rpx;
			width: 45rpx;
			height: 45rpx;
			background: rgba(0, 0, 0, 0.7);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 36rpx;
			color: #FFFFFF;
			font-weight: 300;
		}
	}

	.photo-add {
		width: 100%;
		padding-bottom: 100%;
		position: relative;
		border: 3rpx dashed #FFB6C1;
		border-radius: 20rpx;
		background: rgba(255, 232, 238, 0.3);

		.add-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -60%);
			font-size: 50rpx;
			color: #FFB6C1;
		}

		.add-text {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, 40%);
			font-size: 22rpx;
			color: #FFB6C1;
		}
	}
}

.input-box {
	background: #FFFFFF;
	border-radius: 25rpx;
	padding: 25rpx;
	box-shadow: 0 8rpx 25rpx rgba(255, 105, 180, 0.15);

	.desc-input {
		width: 100%;
		min-height: 120rpx;
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
		margin-bottom: 20rpx;
	}

	.placeholder {
		color: #CCC;
	}

	.input-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.char-count {
			font-size: 22rpx;
			color: #999;
		}

		.upload-btn {
			width: 180rpx;
			height: 70rpx;
			background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
			color: #FFFFFF;
			border: none;
			border-radius: 35rpx;
			font-size: 28rpx;
			font-weight: 600;
			box-shadow: 0 6rpx 18rpx rgba(255, 105, 180, 0.4);

			&.uploading {
				opacity: 0.6;
			}
		}
	}
}

/* 历史照片 */
.history-section {
	margin-bottom: 30rpx;
}

.photo-waterfall {
	column-count: 2;
	column-gap: 15rpx;

	.history-photo-item {
		break-inside: avoid;
		margin-bottom: 15rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.15);
		position: relative;

		.history-photo-img {
			width: 100%;
			display: block;
		}

		.photo-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			padding: 15rpx;
			background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);

			.photo-info {
				.photo-desc {
					display: block;
					font-size: 24rpx;
					color: #FFFFFF;
					margin-bottom: 6rpx;
					line-height: 1.4;
				}

				.photo-date {
					display: block;
					font-size: 20rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}

			.photo-badge-temp {
				position: absolute;
				top: 15rpx;
				right: 15rpx;
				font-size: 20rpx;
				color: #FF69B4;
				background: rgba(255, 255, 255, 0.95);
				padding: 4rpx 12rpx;
				border-radius: 10rpx;
			}
		}
	}
}

/* 空状态 */
.empty-state {
	padding: 100rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 25rpx;
	}

	.pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	.empty-text {
		font-size: 30rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.empty-hint {
		font-size: 24rpx;
		color: #999;
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

/* 骨架屏 */
.skeleton-item {
	break-inside: avoid;
	margin-bottom: 15rpx;
	background: #FFFFFF;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 6rpx 20rpx rgba(255, 105, 180, 0.15);

	.skeleton-img {
		width: 100%;
		height: 300rpx;
		background: #F5F5F5;
	}

	.skeleton-text {
		margin: 15rpx;
		height: 30rpx;
		width: 80%;
		background: #F5F5F5;
		border-radius: 5rpx;
	}
}

.skeleton-animation {
	animation: skeleton-loading 1.5s ease-in-out infinite;
	background: linear-gradient(90deg, #F5F5F5 25%, #E8E8E8 50%, #F5F5F5 75%);
	background-size: 200% 100%;
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

/* 淡入动画 */
.fade-in-up {
	animation: fade-in-up 0.5s ease-out;
}

@keyframes fade-in-up {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 照片操作点 */
.photo-actions {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	backdrop-filter: blur(10rpx);

	.action-dot {
		width: 6rpx;
		height: 6rpx;
		background: #FFFFFF;
		border-radius: 50%;
		box-shadow:
			0 -10rpx 0 #FFFFFF,
			0 10rpx 0 #FFFFFF;
	}
}

/* 上传进度条 */
.upload-progress-bar {
	position: relative;
	margin-top: 20rpx;
	height: 8rpx;
	background: rgba(255, 182, 193, 0.2);
	border-radius: 10rpx;
	overflow: hidden;

	.progress-fill {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		background: linear-gradient(90deg, #FFB6C1 0%, #FF69B4 100%);
		border-radius: 10rpx;
		transition: width 0.3s ease;
	}

	.progress-text {
		position: absolute;
		right: 10rpx;
		top: -30rpx;
		font-size: 22rpx;
		color: #FF69B4;
		font-weight: 600;
	}
}

/* 上传按钮加载动画 */
.upload-btn {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;

	.btn-icon {
		font-size: 28rpx;
	}

	.btn-loading {
		.loading-spinner {
			width: 24rpx;
			height: 24rpx;
			border: 3rpx solid rgba(255, 255, 255, 0.3);
			border-top-color: #FFFFFF;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* 空状态动画优化 */
.empty-state {
	position: relative;

	.empty-animation {
		position: relative;
		width: 200rpx;
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 30rpx;

		.empty-icon {
			position: relative;
			z-index: 2;
		}

		.empty-circle {
			position: absolute;
			border-radius: 50%;
			border: 3rpx solid rgba(255, 182, 193, 0.3);
		}

		.circle-1 {
			width: 120rpx;
			height: 120rpx;
			animation: circle-pulse 3s ease-in-out infinite;
		}

		.circle-2 {
			width: 160rpx;
			height: 160rpx;
			animation: circle-pulse 3s ease-in-out 1s infinite;
		}

		.circle-3 {
			width: 200rpx;
			height: 200rpx;
			animation: circle-pulse 3s ease-in-out 2s infinite;
		}
	}

	.empty-tip {
		display: block;
		margin-top: 15rpx;
		font-size: 22rpx;
		color: #FFB6C1;
		background: rgba(255, 182, 193, 0.1);
		padding: 15rpx 30rpx;
		border-radius: 20rpx;
	}
}

@keyframes circle-pulse {
	0%, 100% {
		transform: scale(1);
		opacity: 0.3;
	}
	50% {
		transform: scale(1.2);
		opacity: 0.1;
	}
}

/* 加载更多 */
.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;

	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid rgba(255, 182, 193, 0.3);
		border-top-color: #FF69B4;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 15rpx;
	}

	.load-text {
		font-size: 26rpx;
		color: #999;
	}
}

.no-more {
	padding: 40rpx 0;
	text-align: center;

	.no-more-text {
		font-size: 26rpx;
		color: #FFB6C1;
	}
}

.bottom-space {
	height: 60rpx;
}
</style>
