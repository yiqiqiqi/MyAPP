<template>
	<view class="about-page">
		<scroll-view class="content" scroll-y>
			<!-- Logo区域 -->
			<view class="logo-section">
				<view class="logo-wrapper">
					<text class="logo-emoji">🐾</text>
				</view>
				<text class="app-name">喵汪兔星河</text>
				<text class="app-slogan">记录每一个萌宠瞬间</text>
			</view>

			<!-- 公司信息 -->
			<view class="company-section">
				<view class="section-title">
					<text>🏢 关于我们</text>
				</view>
				<view class="company-card">
					<view class="info-item">
						<text class="info-label">公司名称</text>
						<text class="info-value">杭州喵汪兔星河科技有限公司</text>
					</view>
					<view class="info-item">
						<text class="info-label">品牌理念</text>
						<text class="info-value">让每一位宠物主人都能轻松分享和保存宠物的美好瞬间</text>
					</view>
					<view class="info-item">
						<text class="info-label">核心功能</text>
						<text class="info-value">宠物照片上传、相册管理、一键分享</text>
					</view>
				</view>
			</view>

			<!-- 特色功能 -->
			<view class="features-section">
				<view class="section-title">
					<text>✨ 产品特色</text>
				</view>
				<view class="feature-list">
					<view class="feature-item">
						<text class="feature-icon">📸</text>
						<view class="feature-content">
							<text class="feature-title">随时上传</text>
							<text class="feature-desc">支持一次上传多张照片，记录宠物成长</text>
						</view>
					</view>
					<view class="feature-item">
						<text class="feature-icon">🔗</text>
						<view class="feature-content">
							<text class="feature-title">一键分享</text>
							<text class="feature-desc">生成专属相册链接，分享给亲朋好友</text>
						</view>
					</view>
					<view class="feature-item">
						<text class="feature-icon">💾</text>
						<view class="feature-content">
							<text class="feature-title">云端存储</text>
							<text class="feature-desc">照片安全存储在云端，永不丢失</text>
						</view>
					</view>
					<view class="feature-item">
						<text class="feature-icon">🎨</text>
						<view class="feature-content">
							<text class="feature-title">可爱风格</text>
							<text class="feature-desc">粉嫩配色，温馨界面，让分享更有爱</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 联系方式 -->
			<view class="contact-section">
				<view class="section-title">
					<text>📞 联系我们</text>
				</view>
				<view class="contact-card">
					<view class="contact-item">
						<text class="contact-icon">📧</text>
						<text class="contact-text">邮箱：contact@petstar.com</text>
					</view>
					<view class="contact-item">
						<text class="contact-icon">🏠</text>
						<text class="contact-text">地址：杭州市</text>
					</view>
				</view>
			</view>

			<!-- 版本信息 -->
			<view class="version-section">
				<text class="version-text">版本号：v1.0.0</text>
				<text class="copyright-text">© 2024 杭州喵汪兔星河科技有限公司</text>
				<text class="copyright-text">All Rights Reserved</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {}
	}
}
</script>

<style lang="scss">
.about-page {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #FFF5F7 0%, #FFE8EE 100%);
}

.content {
	height: 100vh;
	padding: 30rpx;
	box-sizing: border-box;
}

/* Logo区域 */
.logo-section {
	padding: 80rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.logo-wrapper {
		width: 180rpx;
		height: 180rpx;
		background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 30rpx rgba(255, 105, 180, 0.3);
		margin-bottom: 30rpx;

		.logo-emoji {
			font-size: 80rpx;
		}
	}

	.app-name {
		font-size: 44rpx;
		font-weight: 600;
		color: #FF69B4;
		margin-bottom: 15rpx;
	}

	.app-slogan {
		font-size: 28rpx;
		color: #999;
	}
}

/* 通用section标题 */
.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FF69B4;
	margin-bottom: 20rpx;
}

/* 公司信息 */
.company-section {
	margin-bottom: 30rpx;

	.company-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.1);

		.info-item {
			padding: 25rpx 0;
			border-bottom: 1rpx solid #F5F5F5;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				display: block;
				font-size: 26rpx;
				color: #999;
				margin-bottom: 10rpx;
			}

			.info-value {
				display: block;
				font-size: 30rpx;
				color: #333;
				line-height: 1.6;
			}
		}
	}
}

/* 特色功能 */
.features-section {
	margin-bottom: 30rpx;

	.feature-list {
		.feature-item {
			display: flex;
			align-items: flex-start;
			padding: 30rpx;
			background: #FFFFFF;
			border-radius: 24rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.1);

			.feature-icon {
				font-size: 50rpx;
				margin-right: 20rpx;
			}

			.feature-content {
				flex: 1;
				display: flex;
				flex-direction: column;

				.feature-title {
					font-size: 32rpx;
					font-weight: 600;
					color: #FF69B4;
					margin-bottom: 10rpx;
				}

				.feature-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 1.6;
				}
			}
		}
	}
}

/* 联系方式 */
.contact-section {
	margin-bottom: 30rpx;

	.contact-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 20rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.1);

		.contact-item {
			display: flex;
			align-items: center;
			padding: 25rpx 0;

			.contact-icon {
				font-size: 40rpx;
				margin-right: 20rpx;
			}

			.contact-text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}

/* 版本信息 */
.version-section {
	padding: 60rpx 0 100rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	.version-text {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.copyright-text {
		font-size: 24rpx;
		color: #CCC;
		line-height: 1.8;
		text-align: center;
	}
}
</style>
