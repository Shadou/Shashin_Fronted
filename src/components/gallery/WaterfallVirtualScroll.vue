<!-- components/gallery/WaterfallVirtualScroll.vue -->
<template>
  <div class="waterfall-virtual-scroll">
    <!-- 虚拟滚动容器 -->
    <virtual-scroll-list
      ref="virtualListRef"
      :data-key="'index'"
      :data-sources="items"
      :data-component="itemComponent"
      :estimate-size="estimateSize"
      :keeps="keeps"
      :extra-props="extraProps"
      :item-class="'waterfall-item-wrapper'"
      @scroll="handleScroll"
    >
      <!-- 使用正确的插槽语法 -->
      <template v-if="!itemComponent">
        <div
          v-for="source in items"
          :key="source.index"
          :class="['waterfall-item', { 'waterfall-item-loading': !source.loaded }]"
          :style="getItemStyle(source)"
          @click="handleItemClick(source, source.index)"
        >
          <div class="waterfall-image-container">
            <!-- 图片加载状态 -->
            <div v-if="!source.loaded" class="image-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
            </div>

            <!-- 图片 -->
            <el-image
              v-else
              :src="source.url"
              :preview-src-list="previewSrcList"
              :initial-index="source.index"
              fit="cover"
              class="waterfall-image"
              loading="lazy"
              @load="handleImageLoad(source, $event)"
              @error="handleImageError(source)"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>

            <!-- 图片信息 -->
            <div class="image-info-overlay">
              <div class="info-content">
                <div class="filename">{{ getFilename(source.filename) }}</div>
                <div class="size">{{ formatFileSize(source.size) }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="item-actions">
            <el-button type="text" size="small" @click.stop="handleDownload(source)" title="下载">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button
              type="text"
              size="small"
              @click.stop="handlePreview(source, source.index)"
              title="预览"
            >
              <el-icon><View /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </virtual-scroll-list>

    <!-- 加载更多 -->
    <div v-if="loadingMore" class="loading-more">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 没有更多数据 -->
    <div v-if="!hasMore && items.length > 0" class="no-more">已加载所有图片</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, h } from 'vue'
import VirtualScrollList from 'vue3-virtual-scroll-list'
import { ElMessage } from 'element-plus'
import { Loading, Picture, Download, View } from '@element-plus/icons-vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  // 获取图片URL的函数
  getImageUrl: {
    type: Function,
    required: true,
  },
  // 格式化文件大小的函数
  formatFileSize: {
    type: Function,
    required: true,
  },
  // 预览函数
  onPreview: {
    type: Function,
    default: () => {},
  },
  // 下载函数
  onDownload: {
    type: Function,
    default: () => {},
  },
  // 列数
  columnCount: {
    type: Number,
    default: 4,
  },
  // 间距
  gap: {
    type: Number,
    default: 15,
  },
  // 图片宽度
  itemWidth: {
    type: Number,
    default: 250,
  },
  // 是否启用懒加载
  lazyLoad: {
    type: Boolean,
    default: true,
  },
  // 每次加载的数量
  batchSize: {
    type: Number,
    default: 20,
  },
})

const emits = defineEmits(['scroll', 'load-more', 'preview'])

// 状态
const virtualListRef = ref(null)
const items = ref([])
const columnHeights = ref([])
const visibleRange = ref({ start: 0, end: 0 })
const loadingMore = ref(false)
const hasMore = ref(true)

// 虚拟滚动配置
const estimateSize = 300 // 预估每个项目的高度
const keeps = 30 // 保持渲染的项目数量
const overscan = 10 // 额外渲染的项目数量

// 计算属性
const previewSrcList = computed(() => {
  return items.value.filter((item) => item.loaded).map((item) => item.url)
})

// 创建自定义渲染组件
const itemComponent = {
  props: ['source', 'index'],
  render() {
    const { source, index } = this

    return h(
      'div',
      {
        class: ['waterfall-item', { 'waterfall-item-loading': !source.loaded }],
        style: getItemStyle(source),
        onClick: () => handleItemClick(source, index),
      },
      [
        h('div', { class: 'waterfall-image-container' }, [
          // 图片加载状态
          !source.loaded
            ? h('div', { class: 'image-loading' }, [h(Loading, { class: 'loading-icon' })])
            : null,

          // 图片
          source.loaded
            ? h(
                'el-image',
                {
                  src: source.url,
                  fit: 'cover',
                  class: 'waterfall-image',
                  loading: 'lazy',
                  onLoad: (event) => handleImageLoad(source, event),
                  onError: () => handleImageError(source),
                },
                {
                  placeholder: () => h('div', { class: 'image-placeholder' }, [h(Picture)]),
                },
              )
            : null,

          // 图片信息
          h('div', { class: 'image-info-overlay' }, [
            h('div', { class: 'info-content' }, [
              h('div', { class: 'filename' }, getFilename(source.filename)),
              h('div', { class: 'size' }, formatFileSize(source.size)),
            ]),
          ]),
        ]),

        // 操作按钮
        h('div', { class: 'item-actions' }, [
          h(
            'el-button',
            {
              type: 'text',
              size: 'small',
              onClick: (e) => {
                e.stopPropagation()
                handleDownload(source)
              },
              title: '下载',
            },
            { default: () => h(Download) },
          ),

          h(
            'el-button',
            {
              type: 'text',
              size: 'small',
              onClick: (e) => {
                e.stopPropagation()
                handlePreview(source, index)
              },
              title: '预览',
            },
            { default: () => h(View) },
          ),
        ]),
      ],
    )
  },
}

const extraProps = {
  formatFileSize: props.formatFileSize,
  getFilename,
  handleItemClick,
  handleImageLoad,
  handleImageError,
  handleDownload,
  handlePreview,
}

// 生命周期
onMounted(() => {
  initializeItems()
  setupResizeObserver()
  setupIntersectionObserver()
})

onUnmounted(() => {
  cleanup()
})

// 方法
const initializeItems = () => {
  const initialImages = props.images.slice(0, props.batchSize)
  items.value = initialImages.map((img, index) => ({
    index,
    filename: img[0],
    size: img[1],
    url: props.getImageUrl(img[0]),
    loaded: false,
    error: false,
    height: estimateSize,
    column: index % props.columnCount,
    top: 0,
    left: 0,
    visible: false,
  }))

  // 初始化列高度
  columnHeights.value = new Array(props.columnCount).fill(0)

  // 初始布局
  nextTick(() => {
    layoutWaterfall()
  })
}

const setupResizeObserver = () => {
  if (!containerRef.value) return

  const resizeObserver = new ResizeObserver(
    debounce(() => {
      updateLayout()
    }, 200),
  )

  resizeObserver.observe(containerRef.value)
}

const setupIntersectionObserver = () => {
  if (!props.lazyLoad) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index)
          if (index >= 0 && items.value[index]) {
            loadImage(index)
          }
        }
      })
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    },
  )

  // 在图片元素创建后观察
  nextTick(() => {
    const imageElements = document.querySelectorAll('.waterfall-image')
    imageElements.forEach((img, index) => {
      img.dataset.index = index
      observer.observe(img)
    })
  })
}

const loadImage = (index) => {
  if (index >= items.value.length) return

  const item = items.value[index]
  if (item.loaded || item.error) return

  // 模拟加载
  const img = new Image()
  img.src = item.url
  img.onload = () => {
    item.loaded = true
    updateImageHeight(index, img.naturalHeight / img.naturalWidth)
  }
  img.onerror = () => {
    item.error = true
    item.loaded = true // 标记为已加载以显示错误状态
  }
}

const updateImageHeight = (index, aspectRatio) => {
  if (index >= items.value.length) return

  const item = items.value[index]
  const newHeight = props.itemWidth * aspectRatio

  // 如果高度变化超过20%，更新布局
  if (Math.abs(newHeight - item.height) > item.height * 0.2) {
    item.height = newHeight
    updateLayout()
  }
}

const layoutWaterfall = () => {
  if (items.value.length === 0) return

  // 重置列高度
  columnHeights.value = new Array(props.columnCount).fill(0)

  // 计算每个项目的位置
  items.value.forEach((item, index) => {
    // 找到最短的列
    const shortestColumnIndex = columnHeights.value.indexOf(Math.min(...columnHeights.value))

    // 设置项目位置
    item.column = shortestColumnIndex
    item.left = shortestColumnIndex * (props.itemWidth + props.gap)
    item.top = columnHeights.value[shortestColumnIndex]

    // 更新列高度
    columnHeights.value[shortestColumnIndex] += item.height + props.gap
  })

  // 更新容器总高度
  updateContainerHeight()
}

const updateContainerHeight = () => {
  if (!virtualListRef.value) return

  const maxHeight = Math.max(...columnHeights.value)
  const totalHeight = maxHeight > 0 ? maxHeight - props.gap : 0

  // 更新虚拟滚动容器的总高度
  if (virtualListRef.value.setSize) {
    virtualListRef.value.setSize(totalHeight)
  }
}

const updateLayout = () => {
  layoutWaterfall()
}

const getItemStyle = (item) => {
  return {
    position: 'absolute',
    top: `${item.top}px`,
    left: `${item.left}px`,
    width: `${props.itemWidth}px`,
    height: `${item.height}px`,
    transform: `translateY(${item.top}px)`,
  }
}

const handleScroll = (event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  const scrollBottom = scrollTop + clientHeight

  // 触发滚动事件
  emits('scroll', { scrollTop, scrollHeight, clientHeight })

  // 检查是否需要加载更多
  if (scrollHeight - scrollBottom < 500 && hasMore.value && !loadingMore.value) {
    loadMore()
  }

  // 更新可见范围
  updateVisibleRange(scrollTop, clientHeight)
}

const updateVisibleRange = (scrollTop, clientHeight) => {
  if (items.value.length === 0) return

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / estimateSize)
  const endIndex = Math.min(
    items.value.length - 1,
    Math.ceil((scrollTop + clientHeight) / estimateSize),
  )

  visibleRange.value = { start: startIndex, end: endIndex }

  // 懒加载可见图片
  if (props.lazyLoad) {
    for (let i = startIndex; i <= endIndex; i++) {
      if (i < items.value.length && !items.value[i].loaded) {
        loadImage(i)
      }
    }
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true

  try {
    // 触发加载更多事件
    emits('load-more', {
      currentCount: items.value.length,
      batchSize: props.batchSize,
    })

    // 模拟加载延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    const currentLength = items.value.length
    const newImages = props.images.slice(currentLength, currentLength + props.batchSize)

    if (newImages.length === 0) {
      hasMore.value = false
      return
    }

    // 添加新项目
    const newItems = newImages.map((img, i) => ({
      index: currentLength + i,
      filename: img[0],
      size: img[1],
      url: props.getImageUrl(img[0]),
      loaded: false,
      error: false,
      height: estimateSize,
      column: 0,
      top: 0,
      left: 0,
      visible: false,
    }))

    items.value.push(...newItems)

    // 重新布局
    nextTick(() => {
      layoutWaterfall()
    })
  } finally {
    loadingMore.value = false
  }
}

const handleItemClick = (item, index) => {
  emits('preview', { item, index })
}

const handleImageLoad = (item, event) => {
  item.loaded = true
  updateImageHeight(item.index, event.target.naturalHeight / event.target.naturalWidth)
}

const handleImageError = (item) => {
  item.error = true
  item.loaded = true
  ElMessage.error(`图片加载失败: ${item.filename}`)
}

const handleDownload = (item) => {
  props.onDownload(item.filename)
}

const handlePreview = (item, index) => {
  props.onPreview(index)
}

const getFilename = (filename) => {
  if (!filename) return ''
  if (filename.length <= 20) return filename
  return filename.substring(0, 17) + '...'
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const cleanup = () => {
  // 清理观察器
  if (window.ResizeObserver) {
    window.ResizeObserver.disconnect()
  }
}

// 监听图片数组变化
watch(
  () => props.images,
  (newImages) => {
    if (newImages.length > items.value.length) {
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
    updateLayout()
  },
)

// 暴露方法给父组件
defineExpose({
  scrollTo: (index) => {
    if (virtualListRef.value && index >= 0 && index < items.value.length) {
      const item = items.value[index]
      if (virtualListRef.value.scrollTo) {
        virtualListRef.value.scrollTo(item.top)
      }
    }
  },
  refresh: () => {
    initializeItems()
  },
  getVisibleItems: () => {
    return items.value.slice(visibleRange.value.start, visibleRange.value.end)
  },
})
</script>

<style scoped>
.waterfall-virtual-scroll {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 虚拟滚动容器 */
.virtual-scroll-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.waterfall-item-wrapper {
  position: absolute;
  will-change: transform;
  transform-origin: 0 0;
}

.waterfall-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.waterfall-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.waterfall-item-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.waterfall-image-container {
  width: 100%;
  height: calc(100% - 40px);
  position: relative;
  overflow: hidden;
}

.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.loading-icon {
  font-size: 24px;
  color: #409eff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.waterfall-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.waterfall-item:hover .waterfall-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
}

.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.waterfall-item:hover .image-info-overlay {
  opacity: 1;
}

.info-content {
  color: white;
}

.filename {
  font-size: 12px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size {
  font-size: 11px;
  opacity: 0.8;
}

.item-actions {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-top: 1px solid #e8e8e8;
  padding: 0 10px;
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .waterfall-item {
    width: 220px !important;
  }
}

@media (max-width: 768px) {
  .waterfall-item {
    width: calc(50% - 10px) !important;
  }

  .item-actions {
    height: 36px;
    padding: 0 5px;
  }
}

@media (max-width: 480px) {
  .waterfall-item {
    width: 100% !important;
  }
}
</style>
