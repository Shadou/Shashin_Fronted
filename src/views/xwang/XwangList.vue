<template>
  <div class="xwang-list">
    <!-- 回到顶部按钮 -->
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

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" :class="{ 'dark-card': isDarkTheme }">
      <el-form :model="filters" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="filters.search"
            placeholder="标题或角色名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            :class="{ 'dark-input': isDarkTheme }"
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select
            v-model="filters.character"
            placeholder="选择角色"
            filterable
            clearable
            remote
            :remote-method="searchCharacters"
            loading-text="搜索中..."
            style="width: 200px"
            :class="{ 'dark-select': isDarkTheme }"
          >
            <el-option
              v-for="character in characterOptions"
              :key="character._id"
              :label="character.name"
              :value="character.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="评分">
          <el-select
            v-model="filters.star"
            placeholder="选择评分"
            clearable
            :class="{ 'dark-select': isDarkTheme }"
          >
            <el-option
              v-for="star in starOptions"
              :key="star.value"
              :label="star.label"
              :value="star.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters" :class="{ 'dark-btn': isDarkTheme }">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row" :class="{ 'dark-stats': isDarkTheme }">
      <el-col :span="6">
        <el-statistic title="总集数" :value="totalCount" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总图片数" :value="totalImages">
          <template #prefix>
            <el-icon><Picture /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="6">
        <el-statistic title="总大小" :value="formatFileSize(totalSize)" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="平均评分" :value="averageStar" :precision="1">
          <template #prefix>
            <el-icon><Star /></el-icon>
          </template>
        </el-statistic>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <div class="action-bar" :class="{ 'dark-action-bar': isDarkTheme }">
      <div class="left-actions">
        <el-button-group>
          <el-button
            :type="viewMode === 'grid' ? 'primary' : ''"
            @click="viewMode = 'grid'"
            size="small"
            :class="{ 'active-btn': viewMode === 'grid' }"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="viewMode = 'list'"
            size="small"
            :class="{ 'active-btn': viewMode === 'list' }"
          >
            <el-icon><List /></el-icon>
          </el-button>
          <!-- 添加瀑布流按钮 -->
          <el-button
            :type="viewMode === 'waterfall' ? 'primary' : ''"
            @click="viewMode = 'waterfall'"
            size="small"
            :class="{ 'active-btn': viewMode === 'waterfall' }"
          >
            <el-icon><Collection /></el-icon>
          </el-button>
        </el-button-group>

        <!-- 瀑布流设置 -->
        <div v-if="viewMode === 'waterfall'" class="waterfall-settings">
          <el-select
            v-model="waterfallColumnCount"
            @change="handleWaterfallColumnChange"
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
            @change="handleWaterfallItemWidthChange"
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
          v-model="sortBy"
          @change="handleSortChange"
          size="small"
          style="width: 120px; margin-left: 10px"
          :class="{ 'dark-select': isDarkTheme }"
        >
          <el-option label="更新时间" value="updated_at" />
          <el-option label="创建时间" value="created_at" />
          <el-option label="标题" value="title" />
          <el-option label="角色名" value="character" />
          <el-option label="图片数量" value="count" />
          <el-option label="文件大小" value="size" />
          <el-option label="评分" value="star" />
        </el-select>

        <el-select
          v-model="sortOrder"
          @change="handleSortChange"
          size="small"
          style="width: 100px; margin-left: 10px"
          :class="{ 'dark-select': isDarkTheme }"
        >
          <el-option label="降序" value="desc" />
          <el-option label="升序" value="asc" />
        </el-select>
      </div>

      <div class="right-actions">
        <el-dropdown @command="handleExportCommand">
          <el-button type="success" size="small" :class="{ 'dark-btn': isDarkTheme }">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <template #dropdown>
            <el-dropdown-menu :class="{ 'dark-dropdown': isDarkTheme }">
              <el-dropdown-item command="csv">导出为CSV</el-dropdown-item>
              <el-dropdown-item command="excel">导出为Excel</el-dropdown-item>
              <el-dropdown-item command="json">导出为JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div
        v-for="item in xwangList"
        :key="item._id"
        class="grid-item"
        @click="viewDetail(item._id)"
      >
        <el-card class="item-card" shadow="hover" :class="{ 'dark-card': isDarkTheme }">
          <!-- 封面图片 -->
          <div
            class="cover-container"
            @mouseenter="hoverItemId = item._id"
            @mouseleave="hoverItemId = null"
          >
            <el-image
              :src="getCoverImage(item)"
              :fit="getImageFit(item)"
              class="cover-image"
              loading="lazy"
              :preview-src-list="getPreviewList(item)"
              :initial-index="0"
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

            <!-- 悬停覆盖层 -->
            <div v-if="hoverItemId === item._id" class="hover-overlay">
              <div class="overlay-content">
                <div class="overlay-title">{{ truncateText(item.title, 25) }}</div>
                <div class="overlay-meta">
                  <span
                    class="overlay-character character-link"
                    @click.stop="searchByCharacter(item.character)"
                    :title="`搜索角色: ${item.character}`"
                  >
                    {{ item.character }}
                  </span>
                  <span class="overlay-count">{{ item.count }}P</span>
                </div>
              </div>
            </div>

            <!-- 图片数量标签 -->
            <div class="count-badge">
              <span class="count-number">{{ item.count }}</span>
              <el-icon><Picture /></el-icon>
            </div>

            <!-- 评分 -->
            <div class="rating-overlay">
              <StarRating :star="item.star" size="mini" @change.stop="handleStarChange(item._id, $event)" />
            </div>

            <!-- 角色标签 -->
            <div
              class="character-badge"
              @click.stop="searchByCharacter(item.character)"
              :title="`搜索角色: ${item.character}`"
            >
              <span class="character-text">{{ item.character }}</span>
            </div>

            <!-- Xwang ID -->
            <div class="xid-badge">
              <span class="xid-text">{{ item.xid }}</span>
            </div>
          </div>

          <!-- 压缩的信息区域 -->
          <div class="compact-info">
            <div class="compact-title" :title="item.title">
              {{ truncateText(item.title, 20) }}
            </div>
            <div class="compact-meta">
              <span class="meta-size">{{ formatFileSize(item.size) }}</span>
              <span class="meta-date">{{ formatRelativeDate(item.updated_at) }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'" class="list-view">
      <el-table
        :data="xwangList"
        v-loading="loading"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        :class="{ 'dark-table': isDarkTheme }"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image
              :src="getCoverImage(row)"
              fit="cover"
              class="table-cover"
              :preview-src-list="getPreviewList(row)"
            >
              <template #placeholder>
                <div class="table-image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="character" label="角色" width="100" sortable>
          <template #default="{ row }">
            <span
              class="character-text character-link"
              @click.stop="searchByCharacter(row.character)"
              :title="`搜索角色: ${row.character}`"
            >
              {{ row.character }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="180" sortable>
          <template #default="{ row }">
            <div class="table-title" :title="row.title">
              {{ truncateText(row.title, 30) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="xid" label="ID" width="80" sortable>
          <template #default="{ row }">
            <span class="xid-text">{{ row.xid }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="count" label="图片数" width="80" sortable>
          <template #default="{ row }">
            <span class="count-text">{{ row.count }}P</span>
          </template>
        </el-table-column>

        <el-table-column prop="size" label="大小" width="100" sortable>
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>

        <el-table-column prop="star" label="评分" width="120" sortable>
          <template #default="{ row }">
            <StarRating :star="row.star" size="small" @change.stop="handleStarChange(row._id, $event)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 瀑布流视图 -->
    <div v-else-if="viewMode === 'waterfall'" class="waterfall-view">
      <div class="waterfall-container" ref="waterfallContainer" :style="waterfallContainerStyle">
        <div
          v-for="columnIndex in waterfallColumnCount"
          :key="columnIndex"
          class="waterfall-column"
          :style="{
            flex: `1 0 ${100 / waterfallColumnCount}%`,
            maxWidth: `${100 / waterfallColumnCount}%`,
            padding: `0 ${waterfallGap / 2}px`,
          }"
        >
          <div
            v-for="item in getColumnItems(columnIndex - 1)"
            :key="item._id"
            class="waterfall-item"
            @click="viewDetail(item._id)"
          >
            <el-card class="waterfall-card" shadow="hover" :class="{ 'dark-card': isDarkTheme }">
              <!-- 封面图片 -->
              <div class="waterfall-cover-container">
                <el-image
                  :src="getCoverImage(item)"
                  :fit="getImageFit(item)"
                  class="waterfall-cover-image"
                  loading="lazy"
                  @load="handleImageLoad(item, $event)"
                >
                  <template #placeholder>
                    <div class="waterfall-image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                  <template #error>
                    <div class="waterfall-image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>

                <!-- 悬停覆盖层 -->
                <div class="waterfall-hover-overlay">
                  <div class="waterfall-overlay-content">
                    <div class="waterfall-overlay-title">{{ truncateText(item.title, 25) }}</div>
                    <div class="waterfall-overlay-meta">
                      <span
                        class="waterfall-overlay-character character-link"
                        @click.stop="searchByCharacter(item.character)"
                        :title="`搜索角色: ${item.character}`"
                      >
                        {{ item.character }}
                      </span>
                      <span class="waterfall-overlay-count">{{ item.count }}P</span>
                    </div>
                  </div>
                </div>

                <!-- 图片数量标签 -->
                <div class="waterfall-count-badge">
                  <span class="waterfall-count-number">{{ item.count }}</span>
                  <el-icon><Picture /></el-icon>
                </div>

                <!-- 评分 -->
                <div class="waterfall-rating-overlay">
                  <StarRating :star="item.star" size="mini" @change.stop="handleStarChange(item._id, $event)" />
                </div>

                <!-- 角色标签 -->
                <div
                  class="waterfall-character-badge"
                  @click.stop="searchByCharacter(item.character)"
                  :title="`搜索角色: ${item.character}`"
                >
                  <span class="waterfall-character-text">{{ item.character }}</span>
                </div>

                <!-- Xwang ID -->
                <div class="waterfall-xid-badge">
                  <span class="waterfall-xid-text">{{ item.xid }}</span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
        :class="{ 'dark-pagination': isDarkTheme }"
      />
    </div>

    <!-- 批量操作面板 -->
    <BatchOperations
      v-if="selectedItems.length > 0"
      :selected-items="selectedItems"
      :selected-ids="selectedIds"
      operation-type="xwang"
      @batch-update="handleBatchUpdate"
      @delete-selected="handleDeleteSelected"
      @clear-selection="clearSelection"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onActivated, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  Grid,
  List,
  Download,
  Picture,
  User,
  Folder,
  Collection,
  Clock,
  Top,
  Star,
  Key,
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

import { xwangApi } from '@/api/xwang'
import { characterApi } from '@/api/character'
import {
  formatFileSize,
  formatDate,
  saveToSessionStorage,
  getFromSessionStorage,
  removeFromSessionStorage,
} from '@/utils'
import StarRating from '@/components/common/StarRating.vue'
import BatchOperations from '@/components/common/BatchOperations.vue'
import { useSelection } from '@/composables/useSelection'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

// 状态
const xwangList = ref([])
const loading = ref(false)
const viewMode = ref('waterfall')
const hoverItemId = ref(null)

// 回到顶部相关状态
const showBackToTop = ref(false)
const hoverBackToTop = ref(false)

// 图片尺寸缓存
const imageSizes = ref({})

// 分页
const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  pages: 0,
})

// 筛选条件
const filters = reactive({
  search: '',
  character: '',
  star: null,
  sortBy: 'updated_at',
  order: 'desc',
})

// 排序
const sortBy = ref('updated_at')
const sortOrder = ref('desc')

// 瀑布流相关状态
const waterfallColumnCount = ref(4)
const waterfallItemWidth = ref(250)
const waterfallGap = ref(15)
const waterfallContainer = ref(null)

// 角色选项
const characterOptions = ref([])

// 选择功能
const {
  selectedItems,
  selectedIds,
  select,
  unselect,
  toggle,
  selectAll,
  unselectAll,
  isSelected,
  clear: clearSelection,
} = useSelection()

// 导出配置
const exportFormat = ref('csv')
const exportFields = ref(['character', 'title', 'xid', 'count', 'size', 'star', 'created_at'])
const exportScope = ref('current')

// 选项配置
const starOptions = [
  { value: 0, label: '未收藏' },
  { value: 1, label: '一般' },
  { value: 2, label: '很好' },
  { value: 3, label: '优秀' },
  { value: 4, label: '精品' },
  { value: 5, label: '最爱' },
]

// 会话存储的key
const SESSION_STORAGE_KEY = 'xwang_list_state'

// 计算属性
const totalCount = computed(() => pagination.value.total)

const totalImages = computed(() => {
  return xwangList.value.reduce((sum, item) => sum + (item.count || 0), 0)
})

const totalSize = computed(() => {
  return xwangList.value.reduce((sum, item) => sum + (item.size || 0), 0)
})

const averageStar = computed(() => {
  const itemsWithStar = xwangList.value.filter((item) => item.star > 0)
  if (itemsWithStar.length === 0) return 0
  const sum = itemsWithStar.reduce((sum, item) => sum + item.star, 0)
  return sum / itemsWithStar.length
})

const isDarkTheme = computed(() => themeStore.theme === 'dark')

const getImageFit = computed(() => {
  return (item) => {
    const size = imageSizes.value[item._id]
    if (!size) return 'cover'

    // 根据图片宽高比选择不同的fit方式
    const aspectRatio = size.height / size.width
    return aspectRatio > 1.5 ? 'contain' : 'cover'
  }
})

// 瀑布流容器样式
const waterfallContainerStyle = computed(() => {
  return {
    display: 'flex',
    gap: `${waterfallGap.value}px`,
    margin: `0 -${waterfallGap.value / 2}px`,
  }
})

// 计算每列的项目
const getColumnItems = (columnIndex) => {
  if (!xwangList.value || xwangList.value.length === 0) return []

  const result = []
  for (let i = columnIndex; i < xwangList.value.length; i += waterfallColumnCount.value) {
    result.push(xwangList.value[i])
  }
  return result
}

// 生命周期
onMounted(() => {
  // 检查URL参数中是否有角色筛选
  const characterFromUrl = route.query.character
  if (characterFromUrl) {
    // 直接应用角色筛选
    filterByCharacter(characterFromUrl)
  } else {
    loadSavedState()
    fetchXwangList()
  }

  fetchCharacters()

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

// 使用keep-alive时，当组件被激活时触发
onActivated(() => {
  // 当从详情页返回时，尝试恢复状态
  if (getFromSessionStorage(SESSION_STORAGE_KEY + '_from_detail')) {
    loadSavedState()
    fetchXwangList()
    removeFromSessionStorage(SESSION_STORAGE_KEY + '_from_detail')
  }

  // 重新添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

// 滚动监听
const handleScroll = () => {
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  showBackToTop.value = scrollTop > 300
}

// 监听分页变化，实现回到顶部
watch(
  () => pagination.value.page,
  () => {
    // 延迟一小段时间确保DOM更新完成
    setTimeout(() => {
      scrollToTop()
    }, 100)
  },
)

// 监听页面大小变化，实现回到顶部
watch(
  () => pagination.value.limit,
  () => {
    setTimeout(() => {
      scrollToTop()
    }, 100)
  },
)

// 监听瀑布流列数变化
watch(
  () => waterfallColumnCount.value,
  () => {
    // 保存状态
    saveState()
  },
)

// 监听瀑布流项目宽度变化
watch(
  () => waterfallItemWidth.value,
  () => {
    // 保存状态
    saveState()
  },
)

// 保存状态到会话存储
const saveState = () => {
  const state = {
    filters: { ...filters },
    pagination: { ...pagination.value },
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    viewMode: viewMode.value,
    waterfallColumnCount: waterfallColumnCount.value,
    waterfallItemWidth: waterfallItemWidth.value,
  }
  saveToSessionStorage(SESSION_STORAGE_KEY, state)
}

// 从会话存储加载状态
const loadSavedState = () => {
  const savedState = getFromSessionStorage(SESSION_STORAGE_KEY)
  if (savedState) {
    Object.assign(filters, savedState.filters || {})
    Object.assign(pagination.value, savedState.pagination || { page: 1, limit: 24 })
    sortBy.value = savedState.sortBy || 'updated_at'
    sortOrder.value = savedState.sortOrder || 'desc'
    viewMode.value = savedState.viewMode || 'waterfall'
    waterfallColumnCount.value = savedState.waterfallColumnCount || 4
    waterfallItemWidth.value = savedState.waterfallItemWidth || 250
  }
}

// 滚动到顶部
const scrollToTop = () => {
  // 平滑滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// 方法
const fetchXwangList = async () => {
  loading.value = true
  try {
    const response = await xwangApi.getXwang({
      ...filters,
      page: pagination.value.page,
      limit: pagination.value.limit,
      sortBy: sortBy.value,
      order: sortOrder.value,
    })

    xwangList.value = response.data
    pagination.value = response.pagination

    // 重置图片尺寸缓存
    imageSizes.value = {}

    // 保存状态
    saveState()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const fetchCharacters = async () => {
  try {
    const response = await characterApi.getCharacters({ limit: 100 })
    characterOptions.value = response.data
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const searchCharacters = async (query) => {
  if (query) {
    try {
      const response = await characterApi.getCharacters({ search: query, limit: 20 })
      characterOptions.value = response.data
    } catch (error) {
      console.error('搜索角色失败:', error)
    }
  }
}

const handleSearch = () => {
  Object.assign(filters, {
    sortBy: sortBy.value,
    order: sortOrder.value,
  })
  pagination.value.page = 1
  fetchXwangList()
}

// 修改为搜索角色（使用搜索框搜索）
const searchByCharacter = (character) => {
  if (!character) return

  filters.search = character // 使用搜索框搜索
  filters.character = '' // 清空角色筛选框
  filters.star = null // 清空评分筛选
  sortBy.value = 'updated_at' // 重置排序
  sortOrder.value = 'desc' // 重置排序顺序
  pagination.value.page = 1 // 重置页码

  // 更新URL参数但不刷新页面
  router.replace({
    query: { search: character },
  })

  ElMessage.success(`搜索角色: ${character}`)
  handleSearch()
}

// 保留按角色筛选方法（用于URL参数初始化）
const filterByCharacter = (character) => {
  if (!character) return

  filters.character = character
  filters.search = '' // 清空搜索框
  filters.star = null // 清空评分筛选
  sortBy.value = 'updated_at' // 重置排序
  sortOrder.value = 'desc' // 重置排序顺序
  pagination.value.page = 1 // 重置页码

  // 更新URL参数但不刷新页面
  router.replace({
    query: { character },
  })

  ElMessage.success(`已筛选角色: ${character}`)
  handleSearch()
}

const resetFilters = () => {
  filters.search = ''
  filters.character = ''
  filters.star = null
  sortBy.value = 'updated_at'
  sortOrder.value = 'desc'
  // 移除保存的状态
  removeFromSessionStorage(SESSION_STORAGE_KEY)

  // 清除URL参数
  router.replace({ query: {} })

  handleSearch()
}

const handleSortChange = () => {
  handleSearch()
}

const handlePageSizeChange = (size) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchXwangList()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchXwangList()
}

// 瀑布流列数变化处理
const handleWaterfallColumnChange = () => {
  // 不需要重新搜索，只需要更新布局
  saveState()
  // 强制重新渲染瀑布流
  nextTick(() => {
    // 可以在这里添加布局调整逻辑
  })
}

// 瀑布流项目宽度变化处理
const handleWaterfallItemWidthChange = () => {
  saveState()
  // 强制重新渲染瀑布流
  nextTick(() => {
    // 可以在这里添加布局调整逻辑
  })
}

const getCoverImage = (item) => {
  if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) return ''
  const filename = item.images[0][0]
  return xwangApi.buildImageUrl(item, filename)
}

const getPreviewList = (item) => {
  if (!item || !item.images || !Array.isArray(item.images)) return []
  return item.images
    .map((img) => {
      if (Array.isArray(img) && img.length > 0) {
        return xwangApi.buildImageUrl(item, img[0])
      }
      return ''
    })
    .filter((url) => url)
}

// 图片加载处理
const handleImageLoad = (item, event) => {
  if (event.target && event.target.naturalWidth) {
    imageSizes.value[item._id] = {
      width: event.target.naturalWidth,
      height: event.target.naturalHeight,
    }
  }
}

const handleStarChange = async (id, star) => {
  try {
    await xwangApi.updateStar(id, star)

    // 更新本地状态
    const index = xwangList.value.findIndex((item) => item._id === id)
    if (index !== -1) {
      xwangList.value[index].star = star
    }

    ElMessage.success('评分更新成功')
  } catch (error) {
    console.error('评分更新失败:', error)
    ElMessage.error('评分更新失败')
  }
}

const handleBatchUpdate = async (data) => {
  const { ids, value, type } = data

  if (!ids || ids.length === 0) {
    ElMessage.warning('请选择要操作的项目')
    return
  }

  try {
    if (type === 'star') {
      await xwangApi.batchUpdateStar(ids, value)
    }

    // 更新本地状态
    ids.forEach((id) => {
      const index = xwangList.value.findIndex((item) => item._id === id)
      if (index !== -1) {
        if (type === 'star') {
          xwangList.value[index].star = value
        }
      }
    })

    ElMessage.success(`成功更新${ids.length}个项目的${type === 'star' ? '评分' : '分级'}`)
    clearSelection()
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败: ' + (error.message || '未知错误'))
  }
}

const handleDeleteSelected = async (ids) => {
  if (!ids || ids.length === 0) return

  try {
    // 这里需要调用批量删除的API
    // await xwangApi.batchDelete(ids)

    // 暂时只更新本地状态
    xwangList.value = xwangList.value.filter((item) => !ids.includes(item._id))
    pagination.value.total -= ids.length

    ElMessage.success(`成功删除${ids.length}个项目`)
    clearSelection()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败: ' + (error.message || '未知错误'))
  }
}

const viewDetail = (id) => {
  // 保存状态到会话存储
  saveState()
  // 标记是从列表页跳转到详情页
  saveToSessionStorage(SESSION_STORAGE_KEY + '_from_detail', true)
  router.push({ name: 'XwangDetail', params: { id } })
}

const handleRowClick = (row) => {
  viewDetail(row._id)
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return '今天'
    } else if (diffInDays === 1) {
      return '昨天'
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)}周前`
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)}个月前`
    } else {
      return `${Math.floor(diffInDays / 365)}年前`
    }
  } catch (error) {
    return formatDate(dateStr)
  }
}
</script>

<style scoped>
.xwang-list {
  padding: 20px;
  position: relative;
  background-color: var(--bg-color-secondary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
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

.filter-card {
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.filter-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.filter-card :deep(.el-card__header) {
  background-color: var(--bg-color-secondary);
  border-bottom-color: var(--border-color);
  padding: 16px 20px;
  transition: all 0.3s ease;
}

/* 统计卡片暗色主题 */
.stats-row.dark-stats :deep(.el-statistic) {
  color: var(--text-primary-color);
}

.stats-row.dark-stats :deep(.el-statistic__head) {
  color: var(--text-secondary-color);
}

/* 表单样式 */
.filter-card :deep(.el-form-item__label) {
  color: var(--text-secondary-color);
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--bg-color-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.action-bar.dark-action-bar {
  background-color: var(--bg-color-tertiary);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.waterfall-settings {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 可点击的角色链接样式 */
.character-link {
  padding: 0;
  font-size: 12px;
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.character-link:hover {
  color: var(--primary-color-hover);
  text-decoration: underline;
}

/* 网格视图和瀑布流视图中的角色标签点击效果 */
.character-badge,
.waterfall-character-badge {
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.character-badge:hover,
.waterfall-character-badge:hover {
  background-color: rgba(64, 158, 255, 1) !important;
  transform: scale(1.05);
}

/* 悬停覆盖层中的角色链接 */
.overlay-character.character-link,
.waterfall-overlay-character.character-link {
  cursor: pointer;
  transition: background-color 0.2s;
}

.overlay-character.character-link:hover,
.waterfall-overlay-character.character-link:hover {
  background-color: rgba(64, 158, 255, 1) !important;
}

/* 输入框和选择框暗色主题样式 */
:deep(.el-input.dark-input .el-input__wrapper) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  box-shadow: none;
}

:deep(.el-input.dark-input .el-input__inner) {
  color: var(--text-primary-color);
}

:deep(.el-input.dark-input .el-input__placeholder) {
  color: var(--text-tertiary-color);
}

:deep(.el-select.dark-select .el-input__wrapper) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  box-shadow: none;
}

:deep(.el-select.dark-select .el-input__inner) {
  color: var(--text-primary-color);
}

:deep(.el-select.dark-select .el-input__placeholder) {
  color: var(--text-tertiary-color);
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

/* 下拉菜单暗色主题 */
:deep(.el-dropdown-menu.dark-dropdown) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

:deep(.el-dropdown-menu.dark-dropdown .el-dropdown-menu__item) {
  color: var(--text-primary-color);
}

:deep(.el-dropdown-menu.dark-dropdown .el-dropdown-menu__item:hover) {
  background-color: var(--bg-color-tertiary);
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.grid-item {
  cursor: pointer;
  transition: all 0.3s;
}

.grid-item:hover {
  transform: translateY(-4px);
}

.item-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
  overflow: hidden;
}

.item-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background-color: var(--bg-color-secondary);
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.grid-item:hover .cover-image {
  transform: scale(1.05);
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
  font-size: 32px;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-container:hover .hover-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  text-align: center;
}

.overlay-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.overlay-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.overlay-character {
  background-color: rgba(64, 158, 255, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
}

.overlay-count {
  background-color: rgba(103, 194, 58, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
}

.count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  z-index: 5;
}

.count-number {
  font-weight: bold;
}

.rating-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 5;
}

.character-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(64, 158, 255, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 5;
}

.xid-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 5;
}

.xid-text {
  font-weight: 500;
}

/* 压缩信息区域 */
.compact-info {
  padding: 8px;
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.compact-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.compact-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary-color);
}

.meta-size,
.meta-date {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-view {
  margin-bottom: 20px;
}

.list-view :deep(.el-table.dark-table) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

.list-view :deep(.el-table.dark-table th) {
  background-color: var(--bg-color-tertiary);
  color: var(--text-primary-color);
  border-bottom-color: var(--border-color);
}

.list-view :deep(.el-table.dark-table td) {
  background-color: var(--bg-color);
  color: var(--text-primary-color);
  border-bottom-color: var(--border-color);
}

.list-view :deep(.el-table.dark-table .cell) {
  color: var(--text-primary-color);
}

.list-view :deep(.el-table.dark-table .el-table__row:hover) {
  background-color: var(--hover-bg-color);
}

.table-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.table-image-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
}

.table-title {
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary-color);
}

.character-text {
  font-size: 12px;
  color: var(--primary-color);
}

.xid-text {
  font-size: 12px;
  color: var(--warning-color);
}

.count-text {
  font-size: 12px;
  color: var(--text-secondary-color);
}

/* 瀑布流视图样式 */
.waterfall-view {
  width: 100%;
  margin-top: 20px;
}

.waterfall-container {
  display: flex;
}

.waterfall-column {
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  width: 100%;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.waterfall-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.waterfall-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.waterfall-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.waterfall-cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  background-color: var(--bg-color-secondary);
}

.waterfall-cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.waterfall-item:hover .waterfall-cover-image {
  transform: scale(1.05);
}

.waterfall-image-placeholder,
.waterfall-image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary-color);
  font-size: 32px;
  background-color: var(--bg-color-tertiary);
}

.waterfall-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.waterfall-cover-container:hover .waterfall-hover-overlay {
  opacity: 1;
}

.waterfall-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  text-align: center;
}

.waterfall-overlay-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.waterfall-overlay-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.waterfall-overlay-character {
  background-color: rgba(64, 158, 255, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
}

.waterfall-overlay-count {
  background-color: rgba(103, 194, 58, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
}

.waterfall-count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  z-index: 5;
}

.waterfall-count-number {
  font-weight: bold;
}

.waterfall-rating-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 5;
}

.waterfall-character-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(64, 158, 255, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 5;
}

.waterfall-xid-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 5;
}

.waterfall-xid-text {
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 分页暗色主题样式 */
:deep(.el-pagination.dark-pagination) {
  --el-pagination-bg-color: var(--bg-color);
  --el-pagination-button-bg-color: var(--bg-color-secondary);
  --el-pagination-button-color: var(--text-primary-color);
  --el-pagination-button-disabled-bg-color: var(--bg-color-tertiary);
  --el-pagination-button-disabled-color: var(--text-disabled-color);
  --el-pagination-hover-color: var(--primary-color);
}

:deep(.el-pagination.dark-pagination .el-pagination__total),
:deep(.el-pagination.dark-pagination .el-pagination__jump) {
  color: var(--text-secondary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .action-bar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .left-actions,
  .right-actions {
    width: 100%;
    justify-content: center;
  }

  .waterfall-settings {
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  /* 移动端瀑布流调整为2列 */
  .waterfall-container {
    flex-wrap: wrap;
  }

  .waterfall-column {
    flex: 1 0 48%;
    max-width: 48%;
    margin-bottom: 15px;
  }

  /* 移动端调整回到顶部按钮位置 */
  .back-to-top {
    right: 20px;
    bottom: 20px;
  }
}

@media (max-width: 480px) {
  .xwang-list {
    padding: 10px;
  }

  .filter-card {
    margin-bottom: 10px;
  }

  .action-bar {
    padding: 5px;
  }

  .waterfall-settings {
    flex-direction: column;
    align-items: stretch;
  }

  .waterfall-settings .el-select {
    margin-left: 0 !important;
    margin-top: 5px;
    width: 100% !important;
  }

  /* 超小屏幕瀑布流调整为1列 */
  .waterfall-column {
    flex: 1 0 100%;
    max-width: 100%;
    margin-bottom: 15px;
  }

  /* 超小屏幕调整回到顶部按钮 */
  .back-to-top {
    right: 10px;
    bottom: 10px;
  }
}

/* 加载状态 */
:deep(.el-loading-mask) {
  background-color: var(--bg-color);
}

:deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
}

/* 骨架屏样式 */
.loading-container {
  padding: 20px;
}

.loading-container :deep(.el-skeleton) {
  margin-bottom: 20px;
}

.loading-container :deep(.el-skeleton__item) {
  background: linear-gradient(
    90deg,
    var(--bg-color-secondary) 25%,
    var(--bg-color-tertiary) 37%,
    var(--bg-color-secondary) 63%
  );
}

/* 空状态 */
:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__image svg) {
  color: var(--text-tertiary-color);
}

:deep(.el-empty__description) {
  color: var(--text-secondary-color);
}

/* 悬停提示 */
:deep(.el-tooltip__popper) {
  background-color: var(--bg-color) !important;
  color: var(--text-primary-color) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-tooltip__popper .popper__arrow) {
  border-color: var(--border-color) !important;
}
</style>
