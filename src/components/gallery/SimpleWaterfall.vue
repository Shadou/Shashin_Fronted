<template>
  <div class="simple-waterfall" ref="containerRef">
    <!-- 全屏加载指示器 -->
    <div v-if="isLoading" class="fullscreen-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载图片中...</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="hasError" class="error-message">
      <el-alert
        title="图片加载失败"
        type="error"
        :description="errorMessage"
        show-icon
        closable
        @close="hasError = false"
      />
    </div>

    <div class="waterfall-wrapper">
      <!-- 瀑布流容器 -->
      <div
        class="waterfall-container"
        :style="{ height: containerHeight + 'px' }"
        ref="waterfallContainerRef"
      >
        <div
          v-for="(item, index) in imageItems"
          :key="item.id"
          class="waterfall-item"
          :style="getItemStyle(item)"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
        >
          <!-- 图片容器 -->
          <div class="image-container">
            <!-- 使用 el-image 组件 -->
            <el-image
              :src="item.url"
              fit="cover"
              class="waterfall-image"
              loading="lazy"
              :preview-src-list="previewSrcList"
              :initial-index="index"
              @load="handleImageLoad(index, $event)"
              @error="handleImageError(index, $event)"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>

            <!-- 图片信息覆盖层（悬停时显示） -->
            <div
              class="image-overlay"
              :class="{ 'overlay-visible': hoverIndex === index }"
              @click.stop="handlePreview(index)"
            >
              <!-- 透明背景 -->
              <div class="overlay-background"></div>

              <!-- 图片信息（悬停时显示在顶部） -->
              <div class="overlay-info-top" :class="{ 'info-visible': hoverIndex === index }">
                <div class="overlay-filename">{{ getFilename(item.filename) }}</div>
                <div class="overlay-size">{{ formatFileSize(item.size) }}</div>
              </div>

              <!-- 透明操作按钮（悬停时显示在底部） -->
              <div
                class="overlay-actions-bottom"
                :class="{ 'actions-visible': hoverIndex === index }"
              >
                <el-tooltip content="下载" placement="top">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="Download"
                    circle
                    class="transparent-button"
                    @click.stop="handleDownload(item)"
                  />
                </el-tooltip>

                <el-tooltip content="放大查看" placement="top">
                  <el-button
                    type="success"
                    size="small"
                    :icon="ZoomIn"
                    circle
                    class="transparent-button"
                    @click.stop="handlePreview(index)"
                  />
                </el-tooltip>

                <el-tooltip content="详细信息" placement="top">
                  <el-button
                    type="warning"
                    size="small"
                    :icon="InfoFilled"
                    circle
                    class="transparent-button"
                    @click.stop="showImageDetails(item)"
                  />
                </el-tooltip>
              </div>

              <!-- 图片索引（常显在左上角） -->
              <div class="image-index">
                {{ index + 1 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="showLoadMore" class="load-more-container">
      <el-button type="primary" :loading="loadingMore" @click="loadMore" size="large">
        <el-icon><Refresh /></el-icon>
        加载更多图片
      </el-button>
    </div>

    <!-- 全屏查看器 -->
    <ImageViewer
      v-model:visible="fullscreenVisible"
      :images="previewSrcList"
      :initial-index="fullscreenIndex"
      :fullscreen="true"
      @close="fullscreenVisible = false"
    />

    <!-- 图片详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      :title="`图片详情 - ${currentItem?.filename}`"
      width="500px"
      center
    >
      <div class="image-details" v-if="currentItem">
        <div class="detail-item">
          <span class="detail-label">文件名:</span>
          <span class="detail-value">{{ currentItem.filename }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">文件大小:</span>
          <span class="detail-value">{{ formatFileSize(currentItem.size) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">图片尺寸:</span>
          <span class="detail-value">
            {{ currentItem.naturalWidth }} × {{ currentItem.naturalHeight }} 像素
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">图片地址:</span>
          <span class="detail-value url-text">{{ currentItem.url }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailsVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownload(currentItem)"> 下载图片 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, Download, Loading, Refresh, ZoomIn, InfoFilled } from '@element-plus/icons-vue'

// 导入图片查看器组件
import ImageViewer from '@/components/gallery/ImageViewer.vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  getImageUrl: {
    type: Function,
    required: true,
  },
  formatFileSize: {
    type: Function,
    required: true,
  },
  onPreview: {
    type: Function,
    default: () => {},
  },
  onDownload: {
    type: Function,
    default: () => {},
  },
  columnCount: {
    type: Number,
    default: 4,
  },
  gap: {
    type: Number,
    default: 15,
  },
  itemWidth: {
    type: Number,
    default: 280,
  },
  // 每次加载的数量
  batchSize: {
    type: Number,
    default: 50,
  },
  // 是否自动加载所有图片
  autoLoadAll: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['scroll', 'load-more', 'preview'])

// 状态
const containerRef = ref(null)
const imageItems = ref([])
const columnHeights = ref([])
const hoverIndex = ref(-1)
const loadingMore = ref(false)
const hasMore = ref(true)
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const fullscreenVisible = ref(false)
const fullscreenIndex = ref(0)
const detailsVisible = ref(false)
const currentItem = ref(null)

// 组件状态控制
const isMounted = ref(false)

// DOM 引用
const waterfallContainerRef = ref(null)
const containerHeight = ref(0)

// 清理相关
let resizeObserver = null
let resizeTimeout = null

// 计算属性
const previewSrcList = computed(() => {
  return imageItems.value.filter((item) => item.url && !item.error).map((item) => item.url)
})

const showLoadMore = computed(() => {
  return hasMore.value && imageItems.value.length < props.images.length
})

// 生命周期
onMounted(() => {
  isMounted.value = true
  initializeItems()
  setupResizeObserver()
})

onBeforeUnmount(() => {
  isMounted.value = false
})

onUnmounted(() => {
  cleanup()
})

// 方法
const initializeItems = async () => {
  if (!isMounted.value) return

  isLoading.value = true
  hasError.value = false

  try {
    console.log('初始化瀑布流，总图片数:', props.images.length)

    // 如果自动加载所有图片，一次性加载所有
    if (props.autoLoadAll) {
      await loadAllImages()
    } else {
      // 否则分批加载
      await loadMore()
    }
  } catch (error) {
    console.error('初始化失败:', error)
    hasError.value = true
    errorMessage.value = error.message || '初始化失败'
  } finally {
    if (isMounted.value) {
      isLoading.value = false
    }
  }
}

const loadAllImages = async () => {
  if (!isMounted.value) return

  console.log('开始加载所有图片...')

  // 创建所有图片项
  imageItems.value = props.images.map((imgArray, index) => {
    // imgArray 应该是 [filename, size] 格式
    const filename = imgArray[0] || ''
    const size = imgArray[1] || 0
    const url = props.getImageUrl(imgArray)

    console.log(`创建图片项 ${index}:`, { filename, size, url })

    return {
      id: `image-${index}`,
      index,
      filename,
      size,
      url: url,
      loaded: false,
      error: false,
      height: 200, // 默认高度
      column: index % props.columnCount,
      top: 0,
      left: 0,
      naturalWidth: 0,
      naturalHeight: 0,
    }
  })

  console.log('创建了', imageItems.value.length, '个图片项')

  // 标记没有更多图片（因为一次性加载了所有）
  hasMore.value = false

  // 初始布局
  nextTick(() => {
    if (isMounted.value) {
      layoutWaterfall()
    }
  })
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value || !isMounted.value) return

  loadingMore.value = true

  try {
    const currentLength = imageItems.value.length
    const newImages = props.images.slice(currentLength, currentLength + props.batchSize)

    console.log('加载更多图片:', newImages.length)

    if (newImages.length === 0) {
      hasMore.value = false
      return
    }

    // 添加新图片项
    const newItems = newImages.map((imgArray, i) => {
      const filename = imgArray[0] || ''
      const size = imgArray[1] || 0
      const url = props.getImageUrl(imgArray)

      return {
        id: `image-${currentLength + i}`,
        index: currentLength + i,
        filename,
        size,
        url: url,
        loaded: false,
        error: false,
        height: 200,
        column: 0,
        top: 0,
        left: 0,
        naturalWidth: 0,
        naturalHeight: 0,
      }
    })

    imageItems.value.push(...newItems)

    // 更新布局
    nextTick(() => {
      if (isMounted.value) {
        layoutWaterfall()
      }
    })

    // 检查是否还有更多图片
    if (imageItems.value.length >= props.images.length) {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载更多失败:', error)
    if (isMounted.value) {
      ElMessage.error('加载失败: ' + error.message)
    }
  } finally {
    if (isMounted.value) {
      loadingMore.value = false
    }
  }
}

const layoutWaterfall = () => {
  if (!isMounted.value || imageItems.value.length === 0) return

  // 重置列高度
  columnHeights.value = new Array(props.columnCount).fill(0)

  // 计算每个项目的位置
  imageItems.value.forEach((item) => {
    // 找到当前最矮的列
    const shortestColumn = columnHeights.value.indexOf(Math.min(...columnHeights.value))

    // 设置项目位置
    item.column = shortestColumn
    item.left = shortestColumn * (props.itemWidth + props.gap)
    item.top = columnHeights.value[shortestColumn]

    // 如果图片已加载，使用实际高度；否则使用默认高度
    const itemHeight =
      item.naturalHeight > 0
        ? (item.naturalHeight / item.naturalWidth) * props.itemWidth
        : item.height

    // 更新列高度
    columnHeights.value[shortestColumn] += itemHeight + props.gap
  })

  // 设置容器总高度（取最高的列）
  const maxHeight = Math.max(...columnHeights.value)
  containerHeight.value = maxHeight > 0 ? maxHeight - props.gap : 0

  console.log('瀑布流布局完成，容器高度:', containerHeight.value)
}

const getItemStyle = (item) => {
  // 根据图片实际宽高比计算高度
  const height =
    item.naturalHeight > 0
      ? (item.naturalHeight / item.naturalWidth) * props.itemWidth
      : item.height

  return {
    position: 'absolute',
    top: `${item.top}px`,
    left: `${item.left}px`,
    width: `${props.itemWidth}px`,
    height: `${height}px`,
    transition: 'all 0.3s ease',
  }
}

const handleImageLoad = (index, event) => {
  if (!isMounted.value) return

  const item = imageItems.value[index]
  if (!item) return

  console.log(`图片加载成功: ${item.filename}`, {
    naturalWidth: event.target.naturalWidth,
    naturalHeight: event.target.naturalHeight,
  })

  item.loaded = true
  item.naturalWidth = event.target.naturalWidth
  item.naturalHeight = event.target.naturalHeight

  // 更新布局（使用实际高度）
  nextTick(() => {
    if (isMounted.value) {
      layoutWaterfall()
    }
  })
}

const handleImageError = (index, event) => {
  if (!isMounted.value) return

  const item = imageItems.value[index]
  if (!item) return

  console.error(`图片加载失败: 索引 ${index}, 文件名: ${item.filename}, URL: ${item.url}`, event)

  item.loaded = false
  item.error = true
  item.errorMessage = '图片加载失败'
}

const handleDownload = (item) => {
  if (!isMounted.value) return

  console.log('下载图片:', item.filename)
  props.onDownload([item.filename, item.size])
}

const handlePreview = (index) => {
  if (!isMounted.value) return

  console.log('预览图片，索引:', index)
  fullscreenIndex.value = index
  fullscreenVisible.value = true
  props.onPreview(index)
}

const showImageDetails = (item) => {
  if (!isMounted.value) return

  currentItem.value = item
  detailsVisible.value = true
}

const getFilename = (filename) => {
  if (!filename) return ''
  if (filename.length <= 20) return filename
  return filename.substring(0, 17) + '...'
}

// 设置窗口大小变化监听
const setupResizeObserver = () => {
  if (!containerRef.value || !isMounted.value) return

  // 清理现有的观察器
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  resizeObserver = new ResizeObserver(() => {
    // 防抖处理
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (isMounted.value) {
        layoutWaterfall()
      }
    }, 200)
  })

  resizeObserver.observe(containerRef.value)
}

const cleanup = () => {
  // 清理定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 清理全局定时器
  if (window.resizeTimeout) {
    clearTimeout(window.resizeTimeout)
    delete window.resizeTimeout
  }
}

// 监听图片数组变化
watch(
  () => props.images,
  (newImages) => {
    if (!isMounted.value) return

    console.log('图片数组变化:', newImages.length)
    if (newImages.length > imageItems.value.length) {
      hasMore.value = true
      loadMore()
    }
  },
  { deep: true },
)

// 监听列数变化
watch(
  () => props.columnCount,
  () => {
    if (isMounted.value) {
      nextTick(() => {
        layoutWaterfall()
      })
    }
  },
)

// 监听图片宽度变化
watch(
  () => props.itemWidth,
  () => {
    if (isMounted.value) {
      nextTick(() => {
        layoutWaterfall()
      })
    }
  },
)

// 暴露方法给父组件
defineExpose({
  refresh: () => {
    if (isMounted.value) {
      initializeItems()
    }
  },
  scrollTo: (index) => {
    if (!isMounted.value) return

    if (index >= 0 && index < imageItems.value.length) {
      const item = imageItems.value[index]
      if (containerRef.value) {
        containerRef.value.scrollTo({
          top: item.top - 100,
          behavior: 'smooth',
        })
      }
    }
  },
  getItemCount: () => imageItems.value.length,
  cleanup: () => {
    cleanup()
  },
})
</script>

<style scoped>
/* 修改 styles */
.simple-waterfall {
  width: 100%;
  position: relative;
  background-color: transparent;
  /* 移除 overflow: visible */
  min-height: 200px; /* 设置最小高度 */
}

/* 添加包装器 */
.waterfall-wrapper {
  width: 100%;
  position: relative;
}

/* 瀑布流容器 */
.waterfall-container {
  position: relative;
  margin: 0 auto;
  padding: 10px;
  min-height: 100px;
  width: 100%;
  /* 使用动态计算的高度 */
}

/* 全屏加载指示器 */
.fullscreen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  color: #409eff;
  font-size: 18px;
  gap: 15px;
}

.fullscreen-loading .loading-icon {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

/* 错误提示 */
.error-message {
  margin: 20px;
}

/* 瀑布流容器 - 改为自然高度 */
.waterfall-container {
  position: relative;
  margin: 0 auto;
  padding: 10px;
  min-height: 100px;
  width: calc(100% - 20px);
}

/* 瀑布流项目 */
.waterfall-item {
  position: absolute;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 1;
}

.waterfall-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.waterfall-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    45deg,
    #f5f5f5 25%,
    #e8e8e8 25%,
    #e8e8e8 50%,
    #f5f5f5 50%,
    #f5f5f5 75%,
    #e8e8e8 75%
  );
  background-size: 20px 20px;
  color: #909399;
}

.image-error {
  color: #f56c6c;
}

/* 图片覆盖层 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  pointer-events: none;
}

.waterfall-item:hover .image-overlay {
  pointer-events: auto;
}

.overlay-visible {
  opacity: 1;
}

.overlay-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.2) 20%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.2) 80%,
    rgba(0, 0, 0, 0.5) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-visible .overlay-background {
  opacity: 1;
}

/* 顶部信息 */
.overlay-info-top {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  color: white;
  z-index: 2;
  transform: translateY(-20px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.info-visible {
  transform: translateY(0);
  opacity: 1;
}

.overlay-filename {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.overlay-size {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 底部操作按钮 */
.overlay-actions-bottom {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 2;
  transform: translateY(20px);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.actions-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.transparent-button {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease !important;
  color: white !important;
}

.transparent-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: scale(1.1);
}

.transparent-button :deep(.el-icon) {
  color: white !important;
}

/* 图片索引 */
.image-index {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 3;
  pointer-events: none;
}

/* 加载更多按钮 */
.load-more-container {
  text-align: center;
  padding: 30px 20px;
  background-color: transparent;
}

.load-more-container .el-button {
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 图片详情对话框样式 */
.image-details {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.detail-label {
  width: 80px;
  font-weight: bold;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.url-text {
  font-size: 12px;
  color: #909399;
  background-color: #f5f5f5;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .waterfall-container {
    padding: 8px;
    width: calc(100% - 16px);
  }
}

@media (max-width: 768px) {
  .waterfall-container {
    padding: 5px;
    width: calc(100% - 10px);
  }

  .overlay-actions-bottom {
    gap: 10px;
  }

  .transparent-button {
    width: 32px;
    height: 32px;
  }

  .fullscreen-loading {
    font-size: 16px;
  }

  .fullscreen-loading .loading-icon {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .waterfall-container {
    padding: 3px;
    width: calc(100% - 6px);
  }

  .image-index {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: 5px;
    right: 5px;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
