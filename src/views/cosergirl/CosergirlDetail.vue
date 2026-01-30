<template>
  <div class="cosergirl-detail">
    <!-- 一键回到顶部按钮 -->
    <transition name="fade">
      <div
        v-if="showBackToTop"
        class="back-to-top"
        @click="scrollToTop"
        @mouseenter="hoverBackToTop = true"
        @mouseleave="hoverBackToTop = false"
      >
        <el-tooltip :content="hoverBackToTop ? '回到顶部' : ''" placement="left" :show-after="500">
          <el-button type="primary" :circle="true" size="large" class="back-to-top-btn">
            <el-icon :size="20">
              <Top />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </transition>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :count="3" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" title="加载失败" :sub-title="errorMessage">
        <template #extra>
          <el-button type="primary" @click="goBack">返回列表</el-button>
          <el-button @click="retryLoad">重试</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="detail-container" ref="detailContainer">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button type="text" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <!-- 主要内容 -->
      <el-card class="detail-card" :class="{ 'dark-card': isDarkTheme }">
        <template #header>
          <div class="header-content">
            <div class="title-section">
              <h2 class="main-title">{{ detail.title }}</h2>
              <div class="subtitle">
                <!-- 修改角色为可点击 -->
                <el-button
                  type="text"
                  @click="searchByCharacter(detail.character)"
                  class="character-link"
                  :title="`点击搜索角色: ${detail.character}`"
                >
                  {{ detail.character }}
                </el-button>
              </div>
            </div>

            <div class="action-section">
              <StarRating :star="detail.star" @change="handleStarChange" class="detail-rating" />

              <el-button-group>
                <el-button type="primary" @click="openGallery">
                  <el-icon><Picture /></el-icon>
                  浏览图片
                </el-button>
                <el-button type="success" @click="downloadAll">
                  <el-icon><Download /></el-icon>
                  下载全部
                </el-button>
                <el-button type="warning" @click="copyInfo">
                  <el-icon><CopyDocument /></el-icon>
                  复制信息
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <!-- 信息网格 -->
        <div class="info-grid">
          <!-- 左列：基本信息 + 快速操作 -->
          <div class="left-column">
            <el-descriptions title="基本信息" :column="1" border>
              <el-descriptions-item label="角色">
                <!-- 修改角色标签为可点击 -->
                <el-button
                  type="text"
                  @click="searchByCharacter(detail.character)"
                  class="character-link"
                  :title="`点击搜索角色: ${detail.character}`"
                >
                  <el-tag type="primary">{{ detail.character }}</el-tag>
                </el-button>
              </el-descriptions-item>

              <el-descriptions-item label="图片数量">
                <el-tag type="info">{{ detail.count }} 张</el-tag>
              </el-descriptions-item>

              <el-descriptions-item label="文件大小">
                {{ formatFileSize(detail.size) }}
              </el-descriptions-item>

              <el-descriptions-item label="创建时间">
                {{ formatDate(detail.created_at) }}
              </el-descriptions-item>

              <el-descriptions-item label="更新时间">
                {{ formatDate(detail.updated_at) }}
              </el-descriptions-item>

              <el-descriptions-item label="文件路径">
                <el-text type="info" class="file-path">{{ detail.path }}</el-text>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 快速操作 -->
            <div class="quick-actions">
              <h3>快速操作</h3>
              <div class="action-buttons">
                <el-button type="primary" plain @click="openInFolder" :loading="folderLoading">
                  <el-icon><FolderOpened /></el-icon>
                  打开所在文件夹
                </el-button>

                <el-button type="success" plain @click="exportMetadata">
                  <el-icon><Document /></el-icon>
                  导出元数据
                </el-button>

                <el-button type="warning" plain @click="setAsCover">
                  <el-icon><Star /></el-icon>
                  设为收藏封面
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右列：封面预览 -->
          <div class="right-column">
            <div class="cover-preview" :class="{ 'dark-card': isDarkTheme }">
              <div class="preview-title">
                <h3>封面预览</h3>
                <el-button type="text" @click="viewFullCover" size="small">查看原图</el-button>
              </div>

              <div class="preview-image-container" :style="previewContainerStyle">
                <el-image
                  :src="coverImageUrl"
                  :fit="coverImageFit"
                  class="preview-image"
                  :preview-src-list="[coverImageUrl]"
                  loading="lazy"
                  @load="handleCoverImageLoad"
                >
                  <template #placeholder>
                    <div class="preview-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                  <template #error>
                    <div class="preview-error">
                      <el-icon><Picture /></el-icon>
                      <span>封面加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>

              <div class="preview-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="prevImage"
                  :disabled="currentImageIndex === 0"
                  :class="{ 'dark-btn': isDarkTheme }"
                >
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>

                <el-button
                  type="primary"
                  size="small"
                  @click="nextImage"
                  :disabled="currentImageIndex === detail.images.length - 1"
                  :class="{ 'dark-btn': isDarkTheme }"
                >
                  <el-icon><ArrowRight /></el-icon>
                </el-button>

                <div class="image-counter">
                  图片 {{ currentImageIndex + 1 }} / {{ detail.images.length }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片列表部分 -->
        <div class="images-section">
          <div class="section-header">
            <h3>图片列表 ({{ detail.images ? detail.images.length : 0 }})</h3>

            <div class="view-controls" v-if="detail.images && detail.images.length > 0">
              <el-button-group>
                <el-button
                  :type="imagesViewMode === 'grid' ? 'primary' : ''"
                  @click="imagesViewMode = 'grid'"
                  size="small"
                  :class="{ 'active-btn': imagesViewMode === 'grid' }"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button
                  :type="imagesViewMode === 'list' ? 'primary' : ''"
                  @click="imagesViewMode = 'list'"
                  size="small"
                  :class="{ 'active-btn': imagesViewMode === 'list' }"
                >
                  <el-icon><List /></el-icon>
                </el-button>
                <!-- 添加瀑布流按钮 -->
                <el-button
                  :type="imagesViewMode === 'waterfall' ? 'primary' : ''"
                  @click="imagesViewMode = 'waterfall'"
                  size="small"
                  :class="{ 'active-btn': imagesViewMode === 'waterfall' }"
                >
                  <el-icon><Collection /></el-icon>
                </el-button>
              </el-button-group>

              <div class="view-settings" v-if="imagesViewMode === 'waterfall'">
                <el-select
                  v-model="waterfallColumnCount"
                  @change="updateWaterfallSettings"
                  size="small"
                  style="width: 100px; margin-left: 10px"
                  :class="{ 'dark-select': isDarkTheme }"
                >
                  <el-option label="2列" :value="2" />
                  <el-option label="3列" :value="3" />
                  <el-option label="4列" :value="4" />
                  <el-option label="5列" :value="5" />
                </el-select>

                <el-select
                  v-model="waterfallItemWidth"
                  @change="updateWaterfallSettings"
                  size="small"
                  style="width: 120px; margin-left: 10px"
                  :class="{ 'dark-select': isDarkTheme }"
                >
                  <el-option label="小图(200px)" :value="200" />
                  <el-option label="中图(250px)" :value="250" />
                  <el-option label="大图(300px)" :value="300" />
                </el-select>
              </div>

              <el-select
                v-model="imagesSortBy"
                @change="sortImages"
                size="small"
                style="width: 120px; margin-left: 10px"
                :class="{ 'dark-select': isDarkTheme }"
              >
                <el-option label="文件名" value="name" />
                <el-option label="文件大小" value="size" />
                <el-option label="创建时间" value="created" />
              </el-select>
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-if="imagesViewMode === 'grid' && sortedImages.length > 0" class="images-grid">
            <div
              v-for="(image, index) in sortedImages"
              :key="index"
              class="image-item"
              @click="viewImage(index)"
            >
              <div class="image-wrapper">
                <el-image
                  :src="image.proxyUrl || getImageUrl(image.path)"
                  fit="cover"
                  class="image-thumbnail"
                  loading="lazy"
                  :preview-src-list="previewImageList"
                  :initial-index="index"
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

                <div class="image-info">
                  <div class="image-name" :title="image.path">{{ image.path }}</div>
                  <div class="image-size">{{ formatFileSize(image.size || 0) }}</div>
                </div>

                <div class="image-actions">
                  <el-button type="text" size="small" @click.stop="viewImage(index)">
                    查看
                  </el-button>
                  <el-button type="text" size="small" @click.stop="downloadImage(image.path)">
                    下载
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else-if="imagesViewMode === 'list' && sortedImages.length > 0" class="images-list">
            <el-table
              :data="sortedImages"
              @row-click="viewImageByRow"
              :class="{ 'dark-table': isDarkTheme }"
            >
              <el-table-column label="缩略图" width="80">
                <template #default="{ row, $index }">
                  <el-image
                    :src="row.proxyUrl || getImageUrl(row.path)"
                    fit="cover"
                    class="list-thumbnail"
                    loading="lazy"
                  >
                    <template #placeholder>
                      <div class="thumbnail-placeholder">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </template>
              </el-table-column>

              <el-table-column prop="path" label="文件名" min-width="200">
                <template #default="{ row }">
                  <div class="list-filename">{{ row.path }}</div>
                </template>
              </el-table-column>

              <el-table-column label="大小" width="100">
                <template #default="{ row }">
                  {{ formatFileSize(row.size || 0) }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row, $index }">
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="viewImage($index)"
                    :class="{ 'dark-btn': isDarkTheme }"
                  >
                    查看
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    @click.stop="downloadImage(row.path)"
                    :class="{ 'dark-btn': isDarkTheme }"
                  >
                    下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 瀑布流视图 -->
          <div
    v-else-if="imagesViewMode === 'waterfall' && sortedImages.length > 0"
    class="images-waterfall"
  >
    <SimpleWaterfall
      ref="waterfallRef"
      :images="waterfallImages"
      :get-image-url="getWaterfallImageUrl"
      :format-file-size="formatFileSize"
      :column-count="waterfallColumnCount"
      :item-width="waterfallItemWidth"
      :gap="waterfallGap"
      :batch-size="waterfallBatchSize"
      :auto-load-all="waterfallAutoLoadAll"
      :on-preview="handleWaterfallPreview"
      :on-download="downloadWaterfallImage"
      :theme="themeStore.theme"
    />
  </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="暂无图片" />
          </div>
        </div>

        <!-- 相关数据 -->
        <div class="related-section">
          <h3>相关数据</h3>

          <div class="related-grid">
            <!-- 同一角色的其他作品 -->
            <el-card
              class="related-card"
              v-if="sameCharacterItems.length > 0"
              :class="{ 'dark-card': isDarkTheme }"
            >
              <template #header>
                <div class="related-header">
                  <span>同一角色的其他作品</span>
                  <el-badge :value="sameCharacterItems.length" :max="99" />
                </div>
              </template>

              <div class="related-items">
                <div
                  v-for="item in sameCharacterItems.slice(0, 5)"
                  :key="item._id"
                  class="related-item"
                  @click="goToDetail(item._id)"
                >
                  <el-image :src="getCoverImage(item)" fit="cover" class="related-cover" />
                  <div class="related-title">{{ truncateText(item.title, 20) }}</div>
                </div>
              </div>
            </el-card>

            <!-- 相似评分的作品 -->
            <el-card
              class="related-card"
              v-if="sameStarItems.length > 0"
              :class="{ 'dark-card': isDarkTheme }"
            >
              <template #header>
                <div class="related-header">
                  <span>相似评分的作品</span>
                  <StarRating :star="detail.star" size="small" />
                </div>
              </template>

              <div class="related-items">
                <div
                  v-for="item in sameStarItems.slice(0, 5)"
                  :key="item._id"
                  class="related-item"
                  @click="goToDetail(item._id)"
                >
                  <el-image :src="getCoverImage(item)" fit="cover" class="related-cover" />
                  <div class="related-title">{{ truncateText(item.title, 20) }}</div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      v-model:visible="viewerVisible"
      :images="previewImageList"
      :initial-index="viewerIndex"
      @close="closeViewer"
      :theme="themeStore.theme"
    />
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  nextTick,
  onUnmounted,
  onActivated,
  onDeactivated,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Top, Collection } from '@element-plus/icons-vue'
import {
  ArrowLeft,
  ArrowRight,
  Picture,
  Download,
  CopyDocument,
  FolderOpened,
  Document,
  Star,
  Grid,
  List,
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

import { cosergirlApi } from '@/api/cosergirl'
import { formatFileSize, formatDate } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'
import ImageViewer from '@/components/gallery/ImageViewer.vue'
import SimpleWaterfall from '@/components/gallery/SimpleWaterfall.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// 组件状态控制
const isMounted = ref(false)
const abortController = ref(null)

// 状态
const loading = ref(true)
const detail = reactive({
  title: '',
  character: '',
  count: 0,
  size: 0,
  star: 0,
  path: '',
  created_at: '',
  updated_at: '',
  images: [],
})
const currentImageIndex = ref(0)
const imagesViewMode = ref('waterfall') // 默认显示瀑布流
const waterfallRef = ref(null)
const waterfallColumnCount = ref(4)
const waterfallItemWidth = ref(320)
const waterfallGap = ref(10)
const waterfallBatchSize = ref(30)
const waterfallAutoLoadAll = ref(true)
const imagesSortBy = ref('name')
const viewerVisible = ref(false)
const viewerIndex = ref(0)
const folderLoading = ref(false)

// 回到顶部相关状态
const showBackToTop = ref(false)
const hoverBackToTop = ref(false)
const detailContainer = ref(null)

// 封面图片相关状态
const coverImageFit = ref('contain')
const coverImageNaturalSize = reactive({
  width: 0,
  height: 0,
})

// 相关数据
const sameCharacterItems = ref([])
const sameStarItems = ref([])

// 错误状态
const error = ref(false)
const errorMessage = ref('')

// 计算属性
const isDarkTheme = computed(() => themeStore.theme === 'dark')

// 封面预览容器样式计算
const previewContainerStyle = computed(() => {
  if (coverImageNaturalSize.width > 0 && coverImageNaturalSize.height > 0) {
    const aspectRatio = coverImageNaturalSize.height / coverImageNaturalSize.width
    let containerHeight = coverImageNaturalSize.height
    const maxHeight = Math.min(window.innerHeight * 0.6, 500)

    if (containerHeight > maxHeight) {
      containerHeight = maxHeight
    } else if (containerHeight < 200) {
      containerHeight = 200
    }

    return {
      height: `${containerHeight}px`,
      maxHeight: `${maxHeight}px`,
    }
  }

  return {
    height: '300px',
  }
})

// 修复排序错误 - 优先使用 imagesWithUrls
const sortedImages = computed(() => {
  console.log('开始排序图片...')

  // 优先使用 imagesWithUrls，因为它已经包含了完整的URL信息
  const images = detail.imagesWithUrls || detail.images || []

  console.log('原始图片数据:', images)
  console.log('图片数量:', images.length)

  if (!Array.isArray(images) || images.length === 0) {
    console.log('没有图片数据')
    return []
  }

  // 过滤掉无效的图片对象
  const validImages = images.filter(img => {
    if (!img) {
      console.warn('过滤掉空的图片对象')
      return false
    }

    // 检查是否有必要的属性
    const hasUrl = img.proxyUrl || img.url
    const hasPath = img.path
    const isValid = hasUrl || hasPath

    if (!isValid) {
      console.warn('过滤掉无效的图片对象:', img)
    }

    return isValid
  })

  console.log('有效图片数量:', validImages.length)

  const sorted = [...validImages]

  switch (imagesSortBy.value) {
    case 'name':
      return sorted.sort((a, b) => {
        const nameA = a.path || ''
        const nameB = b.path || ''
        return nameA.localeCompare(nameB)
      })
    case 'size':
      return sorted.sort((a, b) => (b.size || 0) - (a.size || 0))
    case 'created':
      // 根据文件名中的数字排序
      return sorted.sort((a, b) => {
        const numA = parseInt(a.path.match(/\d+/)?.[0] || 0)
        const numB = parseInt(b.path.match(/\d+/)?.[0] || 0)
        return numA - numB
      })
    default:
      return sorted
  }
})

// 为瀑布流转换图片格式
const waterfallImages = computed(() => {
  if (!sortedImages.value || !Array.isArray(sortedImages.value)) {
    return []
  }

  return sortedImages.value.map(img => {
    // 确保返回的格式是 [filename, size]
    return [img.path || img.filename || '', img.size || 0]
  })
})

// 封面图片URL计算
const coverImageUrl = computed(() => {
  return detail.coverImageProxy || detail.coverImage || ''
})

// 预览图片列表计算
const previewImageList = computed(() => {
  if (!detail.imagesWithUrls || !Array.isArray(detail.imagesWithUrls) || detail.imagesWithUrls.length === 0) {
    return []
  }

  return detail.imagesWithUrls.map(img => img.proxyUrl || img.url)
})

// 生命周期
onMounted(() => {
  isMounted.value = true
  abortController.value = new AbortController()

  loadDetail()
  loadRelatedData()

  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
  if (detailContainer.value) {
    detailContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  console.log('组件卸载，清理资源...')
  isMounted.value = false

  // 取消所有未完成的网络请求
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }

  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll)
  if (detailContainer.value) {
    detailContainer.value.removeEventListener('scroll', handleScroll)
  }

  // 清理图片加载
  cleanupImageLoading()
})

onActivated(() => {
  console.log('组件激活')
  if (!isMounted.value) {
    isMounted.value = true
    abortController.value = new AbortController()
  }

  // 重新添加滚动事件监听
  window.addEventListener('scroll', handleScroll)
  if (detailContainer.value) {
    detailContainer.value.addEventListener('scroll', handleScroll)
  }
})

onDeactivated(() => {
  console.log('组件停用')
  isMounted.value = false

  // 取消所有未完成的网络请求
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }

  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll)
  if (detailContainer.value) {
    detailContainer.value.removeEventListener('scroll', handleScroll)
  }

  // 清理图片加载
  cleanupImageLoading()
})

// 清理图片加载
const cleanupImageLoading = () => {
  // 这里可以添加清理图片加载的代码
  // 例如，如果有正在加载的图片，可以取消加载
  console.log('清理图片加载...')
}

// 滚动处理函数
const handleScroll = () => {
  // 检查是否滚动超过300px
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  showBackToTop.value = scrollTop > 300
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })

  if (detailContainer.value) {
    detailContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

// 图片加载处理
const handleCoverImageLoad = (event) => {
  if (!isMounted.value) return

  if (event.target && event.target.naturalWidth) {
    coverImageNaturalSize.width = event.target.naturalWidth
    coverImageNaturalSize.height = event.target.naturalHeight

    // 根据图片宽高比选择显示模式
    const aspectRatio = coverImageNaturalSize.height / coverImageNaturalSize.width
    coverImageFit.value = aspectRatio > 1.5 ? 'cover' : 'contain'
  }
}

// 加载详情
const loadDetail = async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''

  try {
    const id = route.params.id
    console.log('开始加载详情，ID:', id)

    const response = await cosergirlApi.getCosergirlById(id, {
      signal: abortController.value?.signal
    })

    // 检查组件是否已卸载
    if (!isMounted.value) {
      console.log('组件已卸载，取消加载')
      return
    }

    if (response.data) {
      Object.assign(detail, response.data)

      // 调试信息
      console.log('API响应完整数据:', response.data)
      console.log('图片数量:', detail.images ? detail.images.length : 0)
      console.log('imagesWithUrls 数量:', detail.imagesWithUrls ? detail.imagesWithUrls.length : 0)
      console.log('coverImageProxy:', detail.coverImageProxy)
      console.log('fullPathInfo:', detail.fullPathInfo)

      // 确保 imagesWithUrls 存在
      if (!detail.imagesWithUrls && detail.images) {
        console.log('创建 imagesWithUrls 数组')
        detail.imagesWithUrls = detail.images.map(img => ({
          path: img.path || img.filename,
          size: img.size || 0,
          proxyUrl: getImageUrl(img.path || img.filename)
        }))
      }

      // 测试第一张图片URL
      if (detail.imagesWithUrls && detail.imagesWithUrls.length > 0) {
        const testImage = detail.imagesWithUrls[0]
        console.log('第一张图片信息:', testImage)

        if (testImage.proxyUrl) {
          // 使用try-catch避免未捕获的Promise错误
          try {
            const response = await fetch(testImage.proxyUrl, {
              method: 'HEAD',
              signal: abortController.value?.signal
            })

            if (isMounted.value) {
              console.log('图片访问测试结果:', response.status, response.ok)
              if (!response.ok) {
                console.warn('图片访问失败:', testImage.proxyUrl)
              }
            }
          } catch (err) {
            if (isMounted.value && err.name !== 'AbortError') {
              console.warn('图片访问测试失败:', err)
            }
          }
        }
      }
    } else {
      throw new Error('未找到数据')
    }
  } catch (err) {
    // 如果是取消请求的错误，不显示错误信息
    if (err.name === 'AbortError') {
      console.log('请求被取消')
      return
    }

    // 检查组件是否已卸载
    if (!isMounted.value) {
      console.log('组件已卸载，忽略错误')
      return
    }

    error.value = true
    errorMessage.value = err.message || '加载详情失败'
    console.error('加载详情失败:', err)
    ElMessage.error(errorMessage.value)

    // 如果组件未卸载，返回列表
    if (isMounted.value) {
      router.back()
    }
  } finally {
    if (isMounted.value) {
      loading.value = false
      console.log('加载完成')
    }
  }
}

// 重试加载
const retryLoad = async () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  abortController.value = new AbortController()
  error.value = false
  errorMessage.value = ''
  await loadDetail()
}

// 加载相关数据
const loadRelatedData = async () => {
  if (!isMounted.value) return

  try {
    if (detail.character) {
      const response = await cosergirlApi.getCosergirl({
        character: detail.character,
        limit: 6,
      }, {
        signal: abortController.value?.signal
      })

      if (isMounted.value) {
        sameCharacterItems.value = response.data.filter((item) => item._id !== detail._id)
      }
    }

    if (detail.star !== undefined) {
      const response = await cosergirlApi.getCosergirl({
        star: detail.star,
        limit: 6,
      }, {
        signal: abortController.value?.signal
      })

      if (isMounted.value) {
        sameStarItems.value = response.data.filter((item) => item._id !== detail._id)
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError' && isMounted.value) {
      console.error('加载相关数据失败:', error)
    }
  }
}

// 按角色搜索
const searchByCharacter = (character) => {
  if (!character) return

  // 跳转到列表页并传递角色参数
  router.push({
    name: 'Cosergirl',
    query: { character },
  })
}

// 获取图片URL - 完整修复版本
const getImageUrl = (filename) => {
  if (!filename) return ''

  // 1. 优先从 imagesWithUrls 中查找
  if (detail.imagesWithUrls && Array.isArray(detail.imagesWithUrls)) {
    const image = detail.imagesWithUrls.find(img => img.path === filename)
    if (image) {
      // 优先使用 proxyUrl
      if (image.proxyUrl) return image.proxyUrl
      // 其次使用 url
      if (image.url) return image.url
    }
  }

  // 2. 如果 imagesWithUrls 中没有，尝试从 images 数组中查找
  if (detail.images && Array.isArray(detail.images)) {
    const image = detail.images.find(img => img.path === filename)
    if (image) {
      // 使用 fullPathInfo 构建URL
      if (detail.fullPathInfo && detail.fullPathInfo.rootId && detail.fullPathInfo.origin) {
        const { rootId, origin } = detail.fullPathInfo
        const path = detail.path || ''
        // 确保路径正确拼接
        const fullPath = encodeURIComponent(`${path}/${image.path}`.replace(/\\/g, '/'))
        return `/api/proxy/file?origin=${origin}&root=${rootId}&path=${fullPath}`
      }
    }
  }

  // 3. 直接构建URL（兼容旧数据）
  if (detail.fullPathInfo && detail.fullPathInfo.rootId && detail.fullPathInfo.origin && detail.path) {
    const { rootId, origin } = detail.fullPathInfo
    const fullPath = encodeURIComponent(`${detail.path}/${filename}`.replace(/\\/g, '/'))
    return `/api/proxy/file?origin=${origin}&root=${rootId}&path=${fullPath}`
  }

  return ''
}

// 为瀑布流准备的图片URL获取函数 - 简化和修复版本
const getWaterfallImageUrl = (imageArray) => {
  if (!Array.isArray(imageArray) || imageArray.length < 1) {
    console.warn('getWaterfallImageUrl: 无效的图片数组:', imageArray)
    return ''
  }

  const filename = imageArray[0]
  if (!filename) {
    console.warn('getWaterfallImageUrl: 文件名为空')
    return ''
  }

  const url = getImageUrl(filename)
  console.log('瀑布流获取图片URL:', { filename, url })
  return url
}

// 为瀑布流准备的下载函数
const downloadWaterfallImage = (imageArray) => {
  if (!Array.isArray(imageArray) || imageArray.length < 1) {
    console.warn('downloadWaterfallImage: 无效的图片数组:', imageArray)
    return
  }

  const filename = imageArray[0]
  if (filename) {
    downloadImage(filename)
  }
}

// 获取封面图片
const getCoverImage = (item) => {
  return item?.coverImageProxy || item?.coverImage || ''
}

// 评分变更处理
const handleStarChange = async (star) => {
  try {
    await cosergirlApi.updateStar(detail._id, star)

    if (isMounted.value) {
      detail.star = star
      ElMessage.success('评分更新成功')
    }
  } catch (error) {
    if (isMounted.value) {
      ElMessage.error('评分更新失败')
    }
  }
}

// 打开画廊
const openGallery = () => {
  viewerIndex.value = 0
  viewerVisible.value = true
}

// 下载所有图片
const downloadAll = async () => {
  try {
    await ElMessageBox.confirm(`确定要下载 ${detail.title} 的所有图片吗？`, '确认下载', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 这里可以实现批量下载逻辑
    ElMessage.info('批量下载功能开发中...')
  } catch (error) {
    if (error !== 'cancel' && isMounted.value) {
      ElMessage.error('下载失败')
    }
  }
}

// 复制信息
const copyInfo = () => {
  const info = `
标题: ${detail.title}
角色: ${detail.character}
图片数量: ${detail.count}
文件大小: ${formatFileSize(detail.size)}
评分: ${detail.star}
创建时间: ${formatDate(detail.created_at)}
更新时间: ${formatDate(detail.updated_at)}
  `.trim()

  navigator.clipboard
    .writeText(info)
    .then(() => {
      if (isMounted.value) {
        ElMessage.success('信息已复制到剪贴板')
      }
    })
    .catch(() => {
      if (isMounted.value) {
        ElMessage.error('复制失败')
      }
    })
}

// 返回列表
const goBack = () => {
  router.back()
}

// 上一张图片
const prevImage = () => {
  if (!detail.images || detail.images.length === 0) return
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    // 重置图片尺寸状态
    coverImageNaturalSize.width = 0
    coverImageNaturalSize.height = 0
    coverImageFit.value = 'contain'
  }
}

// 下一张图片
const nextImage = () => {
  if (!detail.images || detail.images.length === 0) return
  if (currentImageIndex.value < detail.images.length - 1) {
    currentImageIndex.value++
    // 重置图片尺寸状态
    coverImageNaturalSize.width = 0
    coverImageNaturalSize.height = 0
    coverImageFit.value = 'contain'
  }
}

// 查看完整封面
const viewFullCover = () => {
  viewerIndex.value = currentImageIndex.value
  viewerVisible.value = true
}

// 查看图片
const viewImage = (index) => {
  viewerIndex.value = index
  viewerVisible.value = true
}

// 通过行点击查看图片
const viewImageByRow = (row, event) => {
  if (event.target.tagName === 'BUTTON') return
  const index = sortedImages.value.findIndex((img) => img === row)
  if (index !== -1) {
    viewImage(index)
  }
}

// 关闭查看器
const closeViewer = () => {
  viewerVisible.value = false
}

// 打开文件夹
const openInFolder = async () => {
  folderLoading.value = true
  try {
    // 这里可以调用API打开文件管理器
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (isMounted.value) {
      ElMessage.info('文件夹打开功能需要在桌面应用中实现')
    }
  } finally {
    if (isMounted.value) {
      folderLoading.value = false
    }
  }
}

// 导出元数据
const exportMetadata = () => {
  const metadata = {
    ...detail,
    images: detail.images?.map((img) => ({
      filename: img.path,
      size: img.size,
      url: getImageUrl(img.path),
    })),
  }

  const jsonStr = JSON.stringify(metadata, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `metadata_${detail._id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (isMounted.value) {
    ElMessage.success('元数据导出成功')
  }
}

// 设为封面
const setAsCover = () => {
  if (isMounted.value) {
    ElMessage.success('已设置为收藏封面')
  }
}

// 图片排序
const sortImages = () => {
  // sortedImages计算属性会自动更新
}

// 下载单张图片
const downloadImage = async (filename) => {
  try {
    const imageUrl = getImageUrl(filename)
    console.log('下载图片:', { filename, imageUrl })

    const response = await fetch(imageUrl, {
      signal: abortController.value?.signal
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (error.name !== 'AbortError' && isMounted.value) {
      console.error('图片下载失败:', error)
      ElMessage.error('图片下载失败: ' + error.message)
    }
  }
}

// 跳转到详情
const goToDetail = (id) => {
  router.push({ name: 'CosergirlDetail', params: { id } })
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 瀑布流相关方法
const updateWaterfallSettings = () => {
  if (waterfallRef.value && isMounted.value) {
    nextTick(() => {
      waterfallRef.value.refresh()
    })
  }
}

// 瀑布流预览处理
const handleWaterfallPreview = (index) => {
  if (isMounted.value) {
    viewerIndex.value = index
    viewerVisible.value = true
  }
}

// 瀑布流滚动处理
const handleWaterfallScroll = (scrollInfo) => {
  // 可以在这里处理滚动事件，比如隐藏/显示返回顶部按钮等
  console.log('瀑布流滚动:', scrollInfo)
}

// 瀑布流加载更多
const handleWaterfallLoadMore = ({ currentCount, batchSize }) => {
  console.log(`加载更多: 当前 ${currentCount} 张，批次 ${batchSize} 张`)
  // 如果有后端分页，可以在这里加载更多数据
}
</script>

<style scoped>
.cosergirl-detail {
  min-height: 100vh;
  background-color: var(--bg-color-secondary);
  padding: 20px;
  position: relative;
  transition: background-color 0.3s ease;
}

.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* 回到顶部按钮样式 */
.back-to-top {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-to-top-btn {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.back-to-top-btn:active {
  transform: translateY(0);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 可点击的角色链接样式 */
.character-link {
  padding: 0;
  font-size: inherit;
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.character-link:hover {
  color: var(--primary-color-hover);
  text-decoration: underline;
}

.back-button {
  margin-bottom: 20px;
}

.back-button :deep(.el-button) {
  color: var(--text-secondary-color);
}

.back-button :deep(.el-button:hover) {
  color: var(--primary-color);
}

.detail-card {
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.detail-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.detail-card :deep(.el-card__header) {
  background-color: var(--bg-color-secondary);
  border-bottom-color: var(--border-color);
  padding: 20px;
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  flex: 1;
  min-width: 300px;
}

.main-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary-color);
  transition: color 0.3s ease;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-end;
}

.detail-rating {
  background-color: var(--bg-color-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

/* 信息网格布局修改 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  /* 移动端调整回到顶部按钮位置 */
  .back-to-top {
    right: 20px;
    bottom: 20px;
  }
}

/* 左列样式 */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-column :deep(.el-descriptions) {
  margin-bottom: 0;
}

.info-column :deep(.el-descriptions__title) {
  color: var(--text-primary-color);
}

.info-column :deep(.el-descriptions__label) {
  color: var(--text-secondary-color);
  background-color: var(--bg-color-secondary);
}

.info-column :deep(.el-descriptions__content) {
  color: var(--text-primary-color);
  background-color: var(--bg-color);
}

.info-column :deep(.el-tag) {
  transition: all 0.3s ease;
}

.file-path {
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-tertiary-color);
}

/* 快速操作样式调整 */
.quick-actions {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--bg-color-secondary);
  transition: all 0.3s ease;
}

.quick-actions h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-buttons .el-button {
  width: 100%;
  justify-content: flex-start;
  color: var(--text-primary-color);
  border-color: var(--border-color);
  background-color: var(--bg-color);
}

.action-buttons .el-button:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-color-secondary);
}

/* 右列样式 */
.right-column {
  display: flex;
  flex-direction: column;
}

/* 封面预览样式调整 */
.cover-preview {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-color-secondary);
  flex: 1;
  transition: all 0.3s ease;
}

.cover-preview.dark-card {
  background-color: var(--bg-color-tertiary);
}

.preview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.preview-title h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.preview-title .el-button {
  color: var(--primary-color);
}

.preview-image-container {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  min-height: 200px;
  transition: background-color 0.3s ease;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
  object-fit: contain;
  background-color: var(--bg-color);
}

.preview-placeholder,
.preview-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary-color);
}

.preview-error span {
  margin-top: 8px;
  font-size: 14px;
}

.preview-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 12px 16px;
  background-color: var(--bg-color-tertiary);
  border-top: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.image-counter {
  font-size: 14px;
  color: var(--text-secondary-color);
  min-width: 100px;
  text-align: center;
}

/* 按钮暗色主题样式 */
:deep(.el-button.dark-btn) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

:deep(.el-button.dark-btn:hover) {
  background-color: var(--bg-color-tertiary);
  border-color: var(--primary-color);
}

/* 激活按钮样式 */
.active-btn {
  background-color: var(--primary-color) !important;
  color: white !important;
}

.active-btn:hover {
  background-color: var(--primary-color-hover) !important;
  border-color: var(--primary-color-hover) !important;
}

/* 图片列表部分 */
.images-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.view-controls {
  display: flex;
  align-items: center;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.image-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--bg-color);
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
}

.image-info {
  padding: 8px;
  flex: 1;
}

.image-name {
  font-size: 12px;
  color: var(--text-primary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.image-size {
  font-size: 11px;
  color: var(--text-secondary-color);
}

.image-actions {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color-secondary);
}

.images-list {
  margin-top: 20px;
}

.list-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.thumbnail-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
}

.list-filename {
  font-size: 14px;
  color: var(--text-primary-color);
  word-break: break-all;
}

/* 瀑布流容器样式 */
.images-waterfall {
  width: 100%;
  margin-top: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: visible;
  padding: 10px;
  background-color: var(--bg-color-secondary);
  min-height: 200px;
  transition: all 0.3s ease;
}

.view-settings {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

/* 选择框暗色主题样式 */
:deep(.el-select.dark-select .el-input__wrapper) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  box-shadow: none;
}

:deep(.el-select.dark-select .el-input__inner) {
  color: var(--text-primary-color);
}

:deep(.el-select.dark-select .el-input__suffix .el-icon) {
  color: var(--text-secondary-color);
}

/* 相关数据 */
.related-section {
  margin-top: 30px;
}

.related-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.related-card {
  height: 100%;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.related-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.related-card :deep(.el-card__header) {
  background-color: var(--bg-color-tertiary);
  border-bottom-color: var(--border-color);
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-header span {
  color: var(--text-primary-color);
  font-weight: 500;
}

.related-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
}

.related-item {
  width: 80px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  transform: scale(1.05);
}

.related-cover {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  background-color: var(--bg-color-secondary);
}

.related-title {
  font-size: 12px;
  color: var(--text-secondary-color);
  margin-top: 4px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .action-section {
    align-items: stretch;
    width: 100%;
  }

  .images-waterfall {
    padding: 5px;
  }

  .view-settings {
    margin-left: 10px;
    flex-wrap: wrap;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .preview-image-container {
    padding: 10px;
  }

  .quick-actions {
    padding: 15px;
  }

  .action-buttons .el-button {
    font-size: 14px;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .image-thumbnail {
    height: 100px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }

  /* 移动端调整回到顶部按钮 */
  .back-to-top {
    right: 15px;
    bottom: 15px;
  }

  .back-to-top-btn {
    width: 40px;
    height: 40px;
  }
}

/* 小屏幕设备调整 */
@media (max-width: 480px) {
  .preview-title {
    padding: 8px 12px;
  }

  .preview-title h3 {
    font-size: 14px;
  }

  .quick-actions h3 {
    font-size: 14px;
  }

  .action-buttons .el-button {
    padding: 8px 12px;
  }

  .view-controls {
    flex-wrap: wrap;
    gap: 10px;
  }

  /* 超小屏幕调整回到顶部按钮 */
  .back-to-top {
    right: 10px;
    bottom: 10px;
  }
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container :deep(.el-result__title p) {
  color: var(--text-primary-color);
}

.error-container :deep(.el-result__subtitle p) {
  color: var(--text-secondary-color);
}

/* 全局对话框样式覆盖 */
:deep(.el-dialog) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

:deep(.el-dialog__title) {
  color: var(--text-primary-color);
}

:deep(.el-dialog__header) {
  border-bottom-color: var(--border-color);
}
</style>
