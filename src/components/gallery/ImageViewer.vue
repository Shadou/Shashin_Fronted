<template>
  <div class="image-viewer-overlay" v-if="visible" @click="handleOverlayClick">
    <!-- 独立的关闭按钮（在遮罩层上方） -->
    <div class="global-close-button" @click.stop="close">
      <el-icon><Close /></el-icon>
    </div>

    <div class="image-viewer-container" @click.stop>
      <!-- 工具栏 -->
      <div class="viewer-toolbar">
        <div class="toolbar-left">
          <span class="image-info">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <span class="scale-info">缩放: {{ Math.round(scale * 100) }}%</span>
          <span class="rotation-info">旋转: {{ rotation }}°</span>
        </div>

        <div class="toolbar-center">
          <el-button-group>
            <el-button @click="zoomOut" size="small">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="resetScale" size="small" title="重置为最佳大小">
              最佳大小
            </el-button>
            <el-button @click="zoomIn" size="small">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button @click="rotateLeft" size="small">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
            <el-button @click="rotateRight" size="small">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button @click="toggleFullscreen" size="small">
              <el-icon><FullScreen /></el-icon>
            </el-button>
            <el-button @click="downloadCurrent" size="small">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-button-group>
        </div>

        <div class="toolbar-right">
          <!-- 移除了这里的关闭按钮 -->
        </div>
      </div>

      <!-- 图片容器 -->
      <div class="image-container" ref="imageContainer">
        <div
          class="image-wrapper"
          :style="{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }"
        >
          <img
            :src="currentImage"
            :alt="`Image ${currentIndex + 1}`"
            @load="handleImageLoad"
            @error="handleImageError"
            class="viewer-image"
            ref="imageElement"
          />
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span class="loading-text">加载中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-if="imageError" class="error-overlay">
          <el-icon><Picture /></el-icon>
          <span class="error-text">图片加载失败</span>
          <el-button @click="retryLoad" size="small">重试</el-button>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div
        class="nav-button prev-button"
        :class="{ disabled: currentIndex === 0 }"
        @click="prevImage"
      >
        <el-icon><ArrowLeft /></el-icon>
      </div>

      <div
        class="nav-button next-button"
        :class="{ disabled: currentIndex === images.length - 1 }"
        @click="nextImage"
      >
        <el-icon><ArrowRight /></el-icon>
      </div>

      <!-- 缩略图栏 -->
      <div class="thumbnail-bar" v-if="images.length > 1">
        <div class="thumbnails-scroll">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="thumbnail-item"
            :class="{ active: index === currentIndex }"
            @click="goToImage(index)"
          >
            <img :src="image" :alt="`Thumbnail ${index + 1}`" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted, onMounted } from 'vue'
import {
  ZoomIn,
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  Download,
  Close,
  Loading,
  Picture,
  ArrowLeft,
  ArrowRight,
} from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  images: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:visible', 'close'])

// 状态
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const rotation = ref(0)
const loading = ref(true)
const imageError = ref(false)

// 引用
const imageContainer = ref(null)
const imageElement = ref(null)

// 图片原始尺寸和最佳缩放比例
const imageNaturalSize = ref({ width: 0, height: 0 })
const optimalScale = ref(1)

// 计算属性
const currentImage = ref(props.images[props.initialIndex] || '')

// 计算最佳缩放比例
const calculateOptimalScale = () => {
  if (!imageContainer.value || !imageElement.value) return 1

  const containerWidth = imageContainer.value.clientWidth
  const containerHeight = imageContainer.value.clientHeight

  let imgWidth = imageNaturalSize.value.width
  let imgHeight = imageNaturalSize.value.height

  if (rotation.value % 180 !== 0) {
    ;[imgWidth, imgHeight] = [imgHeight, imgWidth]
  }

  const scaleX = containerWidth / imgWidth
  const scaleY = containerHeight / imgHeight

  return Math.min(scaleX, scaleY, 1)
}

// 更新最佳缩放比例
const updateOptimalScale = () => {
  optimalScale.value = calculateOptimalScale()
  scale.value = optimalScale.value
}

// 方法
const close = () => {
  emit('update:visible', false)
  emit('close')
  resetViewer()
}

const handleOverlayClick = (event) => {
  // 点击图片周围的空白区域也关闭（排除工具栏和缩略图区域）
  const target = event.target
  if (target.classList.contains('image-viewer-overlay') ||
      target.classList.contains('image-container')) {
    close()
  }
}

const goToImage = (index) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    currentImage.value = props.images[index]
    loading.value = true
    imageError.value = false
    resetTransform()
  }
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    goToImage(currentIndex.value - 1)
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    goToImage(currentIndex.value + 1)
  }
}

const zoomIn = () => {
  scale.value = Math.min(5, scale.value + 0.25)
}

const zoomOut = () => {
  scale.value = Math.max(0.1, scale.value - 0.25)
}

const resetScale = () => {
  updateOptimalScale()
}

const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360
  nextTick(() => {
    updateOptimalScale()
  })
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
  nextTick(() => {
    updateOptimalScale()
  })
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const downloadCurrent = async () => {
  try {
    const response = await fetch(currentImage.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `image_${currentIndex.value + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载图片失败:', error)
  }
}

const handleImageLoad = () => {
  loading.value = false
  imageError.value = false

  if (imageElement.value) {
    imageNaturalSize.value = {
      width: imageElement.value.naturalWidth,
      height: imageElement.value.naturalHeight,
    }

    updateOptimalScale()
  }
}

const handleImageError = () => {
  loading.value = false
  imageError.value = true
}

const retryLoad = () => {
  loading.value = true
  imageError.value = false
  const img = new Image()
  img.src = currentImage.value
  img.onload = () => {
    loading.value = false
  }
  img.onerror = () => {
    loading.value = false
    imageError.value = true
  }
}

const resetTransform = () => {
  rotation.value = 0
  nextTick(() => {
    updateOptimalScale()
  })
}

const resetViewer = () => {
  currentIndex.value = props.initialIndex
  resetTransform()
  loading.value = true
  imageError.value = false
}

// 处理窗口大小变化
const handleResize = () => {
  if (props.visible && imageContainer.value) {
    updateOptimalScale()
  }
}

// 处理鼠标滚轮缩放
const handleWheel = (event) => {
  if (!props.visible) return

  event.preventDefault()
  if (event.deltaY < 0) {
    scale.value = Math.min(5, scale.value + 0.1)
  } else {
    scale.value = Math.max(0.1, scale.value - 0.1)
  }
}

// 键盘快捷键
const handleKeyDown = (event) => {
  if (!props.visible) return

  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomIn()
      }
      break
    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomOut()
      }
      break
    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        resetScale()
      }
      break
    case 'r':
    case 'R':
      rotateRight()
      break
    case '1':
      resetScale()
      break
  }
}

// 生命周期
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      goToImage(props.initialIndex)
      document.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', handleResize)
      document.addEventListener('wheel', handleWheel, { passive: false })
      document.body.style.overflow = 'hidden'

      // 添加触摸关闭支持
      document.addEventListener('touchstart', handleTouchStart)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('touchstart', handleTouchStart)
      document.body.style.overflow = ''
    }
  },
)

watch(
  () => props.initialIndex,
  (newVal) => {
    if (props.visible) {
      goToImage(newVal)
    }
  },
)

// 触摸关闭支持
const touchStartY = ref(0)
const handleTouchStart = (event) => {
  // 记录触摸开始位置
  touchStartY.value = event.touches[0].clientY
}

const handleTouchEnd = (event) => {
  // 向下滑动关闭（滑动距离大于50px）
  const touchEndY = event.changedTouches[0].clientY
  const diff = touchEndY - touchStartY.value

  if (diff > 50) {
    close()
  }
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('wheel', handleWheel)
  document.removeEventListener('touchstart', handleTouchStart)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* 添加指针样式，提示可点击关闭 */
}

/* 全局关闭按钮 */
.global-close-button {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10000;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.global-close-button:hover {
  background-color: rgba(64, 158, 255, 0.9);
  transform: scale(1.1);
  border-color: rgba(64, 158, 255, 0.8);
}

.image-viewer-container {
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  overflow: hidden;
  cursor: default; /* 容器内部恢复默认指针 */
}

.viewer-toolbar {
  height: 60px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-info {
  font-weight: bold;
  color: #409eff;
}

.scale-info,
.rotation-info {
  font-size: 12px;
  color: #ccc;
  margin-left: 10px;
}

.image-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in; /* 图片区域显示放大镜指针 */
}

.image-wrapper {
  transition: transform 0.2s ease;
  will-change: transform;
}

.viewer-image {
  max-width: none;
  max-height: none;
  display: block;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  gap: 10px;
}

.loading-icon {
  font-size: 48px;
  animation: rotate 2s linear infinite;
}

.error-overlay {
  color: #f56c6c;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.nav-button:hover {
  background-color: rgba(64, 158, 255, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.nav-button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-button.disabled:hover {
  background-color: rgba(0, 0, 0, 0.5);
  transform: translateY(-50%);
}

.prev-button {
  left: 20px;
}

.next-button {
  right: 20px;
}

.thumbnail-bar {
  height: 100px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  flex-shrink: 0;
  overflow-x: auto;
}

.thumbnails-scroll {
  display: flex;
  gap: 10px;
  height: 100%;
  align-items: center;
}

.thumbnail-item {
  width: 70px;
  height: 70px;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.thumbnail-item:hover {
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: #409eff;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .image-viewer-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .global-close-button {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
  }

  .toolbar-center {
    display: none;
  }

  .thumbnail-bar {
    height: 60px;
  }

  .thumbnail-item {
    width: 50px;
    height: 50px;
  }

  .nav-button {
    width: 40px;
    height: 40px;
    bottom: 100px;
    top: auto;
    transform: none;
  }

  .prev-button {
    left: 20px;
  }

  .next-button {
    right: 20px;
  }
}
</style>
