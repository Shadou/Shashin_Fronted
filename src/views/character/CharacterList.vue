<template>
  <div class="character-list">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card" :class="{ 'dark-card': isDarkTheme }">
        <div class="filter-row">
          <el-input
            v-model="filters.search"
            placeholder="搜索角色名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            :class="{ 'dark-input': isDarkTheme }"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div class="filter-actions">
            <el-select
              v-model="filters.ageRating"
              placeholder="按分级筛选"
              clearable
              @change="handleFilterChange"
              :class="{ 'dark-select': isDarkTheme }"
            >
              <el-option label="全部分级" :value="null" />
              <el-option
                v-for="rating in ageRatingOptions"
                :key="rating.value"
                :label="rating.label"
                :value="rating.value"
              />
            </el-select>

            <el-select
              v-model="filters.star"
              placeholder="按评分筛选"
              clearable
              @change="handleFilterChange"
              :class="{ 'dark-select': isDarkTheme }"
            >
              <el-option label="全部分级" :value="null" />
              <el-option
                v-for="star in starOptions"
                :key="star.value"
                :label="star.label"
                :value="star.value"
              />
            </el-select>

            <el-button type="primary" @click="refreshList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>

            <el-button type="success" @click="showCreateDialog">
              <el-icon><Plus /></el-icon>
              新建角色
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section" v-if="showStats">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in starStatistics" :key="stat.label">
          <el-statistic
            :title="stat.label"
            :value="stat.value"
            :value-style="{ color: stat.color }"
            :class="{ 'dark-statistic': isDarkTheme }"
          >
            <template #prefix>
              <el-icon><StarFilled /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </div>

    <!-- 角色列表 -->
    <div class="list-section">
      <el-card :class="{ 'dark-card': isDarkTheme }">
        <template #header>
          <div class="list-header">
            <span class="list-title">角色列表 ({{ characterStore.characterCount }})</span>
            <div class="header-actions">
              <el-button-group>
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : ''"
                  @click="viewMode = 'grid'"
                  :class="{ 'active-btn': viewMode === 'grid' }"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : ''"
                  @click="viewMode = 'list'"
                  :class="{ 'active-btn': viewMode === 'list' }"
                >
                  <el-icon><List /></el-icon>
                </el-button>
              </el-button-group>

              <el-select
                v-model="sortBy"
                @change="handleSortChange"
                style="width: 120px; margin-left: 10px"
                :class="{ 'dark-select': isDarkTheme }"
              >
                <el-option label="名称" value="name" />
                <el-option label="评分" value="star" />
                <el-option label="分级" value="age_rating" />
                <el-option label="更新时间" value="updated_at" />
              </el-select>

              <el-select
                v-model="sortOrder"
                @change="handleSortChange"
                style="width: 100px; margin-left: 10px"
                :class="{ 'dark-select': isDarkTheme }"
              >
                <el-option label="升序" value="asc" />
                <el-option label="降序" value="desc" />
              </el-select>
            </div>
          </div>
        </template>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="character-grid">
          <div
            v-for="character in characterStore.characters"
            :key="character._id"
            class="character-card"
            @click="goToDetail(character._id)"
          >
            <el-card shadow="hover" class="character-item" :class="{ 'dark-card': isDarkTheme }">
              <template #header>
                <div class="card-header">
                  <span class="character-name">{{ character.name }}</span>
                  <div class="card-actions">
                    <AgeRatingTag :rating="character.age_rating" />
                  </div>
                </div>
              </template>

              <div class="character-info">
                <div class="star-section">
                  <StarRating
                    :star="character.star"
                    @change="handleStarChange(character._id, $event)"
                  />
                </div>

                <div class="tags-section" v-if="character.tags && character.tags.length">
                  <el-tag
                    v-for="tag in character.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="tag-item"
                    :type="getTagType(tag)"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag v-if="character.tags.length > 3" size="small" type="info">
                    +{{ character.tags.length - 3 }}
                  </el-tag>
                </div>

                <div class="meta-info">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatDate(character.updated_at) }}</span>
                  </div>
                </div>
              </div>

              <template #footer>
                <div class="card-footer">
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="goToDetail(character._id)"
                    :class="{ 'dark-btn': isDarkTheme }"
                  >
                    查看详情
                  </el-button>
                  <el-button
                    type="warning"
                    size="small"
                    @click.stop="editCharacter(character)"
                    :class="{ 'dark-btn': isDarkTheme }"
                  >
                    编辑
                  </el-button>
                </div>
              </template>
            </el-card>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="character-table">
          <el-table
            :data="characterStore.characters"
            v-loading="characterStore.isLoading"
            @row-click="handleRowClick"
            :class="{ 'dark-table': isDarkTheme }"
          >
            <el-table-column prop="name" label="角色名称" width="200" fixed>
              <template #default="{ row }">
                <div class="character-name-cell">
                  <span class="name">{{ row.name }}</span>
                  <AgeRatingTag :rating="row.age_rating" size="small" />
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="names_like" label="相似名称" width="200">
              <template #default="{ row }">
                <div class="names-like">
                  <el-tag
                    v-for="name in row.names_like?.slice(0, 2)"
                    :key="name"
                    size="small"
                    class="mr-1 mb-1"
                    type="info"
                  >
                    {{ name }}
                  </el-tag>
                  <el-tag
                    v-if="row.names_like && row.names_like.length > 2"
                    size="small"
                    type="info"
                  >
                    +{{ row.names_like.length - 2 }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="star" label="评分" width="150">
              <template #default="{ row }">
                <StarRating :star="row.star" />
              </template>
            </el-table-column>

            <el-table-column prop="tags" label="标签" width="200">
              <template #default="{ row }">
                <div class="tags-cell">
                  <el-tag
                    v-for="tag in row.tags?.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="mr-1 mb-1"
                    :type="getTagType(tag)"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="updated_at" label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updated_at) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="goToDetail(row._id)"
                  :class="{ 'dark-btn': isDarkTheme }"
                >
                  详情
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  @click.stop="editCharacter(row)"
                  :class="{ 'dark-btn': isDarkTheme }"
                >
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <Pagination
          v-model:page="pagination.page"
          v-model:limit="pagination.limit"
          :total="pagination.total"
          @change="handlePaginationChange"
          :class="{ 'dark-pagination': isDarkTheme }"
        />
      </el-card>
    </div>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量操作" width="400px">
      <div class="batch-dialog">
        <el-form label-width="80px">
          <el-form-item label="评分">
            <StarRating v-model="batchStar" :disabled="false" />
          </el-form-item>
          <el-form-item label="分级">
            <el-select v-model="batchAgeRating" style="width: 100%">
              <el-option
                v-for="rating in ageRatingOptions"
                :key="rating.value"
                :label="rating.label"
                :value="rating.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchUpdate"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '@/stores/characterStore'
import { useThemeStore } from '@/stores/theme'
import { formatDate } from '@/utils'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, Grid, List, Clock, StarFilled } from '@element-plus/icons-vue'

// 组件
import Pagination from '@/components/common/Pagination.vue'
import StarRating from '@/components/common/StarRating.vue'
import AgeRatingTag from '@/components/common/AgeRatingTag.vue'

const router = useRouter()
const characterStore = useCharacterStore()
const themeStore = useThemeStore()

// 响应式引用store状态
const { pagination } = storeToRefs(characterStore)

// 本地状态
const viewMode = ref('grid')
const sortBy = ref('name')
const sortOrder = ref('asc')
const batchDialogVisible = ref(false)
const batchStar = ref(0)
const batchAgeRating = ref(1)

// 筛选条件
const filters = ref({
  search: '',
  ageRating: null,
  star: null,
})

// 选项数据
const ageRatingOptions = [
  { value: 1, label: 'G - 全年龄' },
  { value: 2, label: 'PG - 家长指导' },
  { value: 3, label: 'PG-13 - 13岁以上' },
  { value: 4, label: 'R - 限制级' },
  { value: 5, label: 'NC-17 - 成人内容' },
]

const starOptions = [
  { value: 0, label: '未收藏' },
  { value: 1, label: '一般' },
  { value: 2, label: '还行' },
  { value: 3, label: '不错' },
  { value: 4, label: '很好' },
  { value: 5, label: '最爱' },
]

// 计算属性
const isDarkTheme = computed(() => themeStore.theme === 'dark')

const showStats = computed(() => {
  return characterStore.starStats && Object.keys(characterStore.starStats).length > 0
})

const starStatistics = computed(() => {
  const stats = characterStore.starStats
  return Object.entries(stats).map(([key, value]) => {
    const level = getStarInfo(parseInt(key))
    return {
      label: level.label,
      value,
      color: level.color,
    }
  })
})

// 获取评分信息
const getStarInfo = (star) => {
  const starInfo = {
    0: { label: '未收藏', color: '#ccc' },
    1: { label: '一般', color: '#FFD700' },
    2: { label: '还行', color: '#FFA500' },
    3: { label: '不错', color: '#FF6347' },
    4: { label: '很好', color: '#DC143C' },
    5: { label: '最爱', color: '#8B0000' },
  }
  return starInfo[star] || starInfo[0]
}

// 获取标签类型
const getTagType = (tag) => {
  const tagTypes = {
    default: 'info',
    success: ['可爱', '萝莉', '御姐'],
    warning: ['学生', '女仆'],
    danger: ['泳装', '内衣'],
  }

  for (const [type, tags] of Object.entries(tagTypes)) {
    if (Array.isArray(tags) && tags.includes(tag)) {
      return type
    }
  }

  return 'info'
}

// 生命周期
onMounted(async () => {
  await fetchCharacters()
  await characterStore.fetchStats()
})

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

// 方法
const fetchCharacters = async () => {
  try {
    await characterStore.fetchCharacters({
      ...filters.value,
      sortBy: sortBy.value,
      order: sortOrder.value,
    })
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const handleSearch = debounce(() => {
  characterStore.updateFilters({
    search: filters.value.search,
  })
  fetchCharacters()
}, 500)

const handleFilterChange = () => {
  characterStore.updateFilters({
    age_rating: filters.value.ageRating,
    star: filters.value.star,
  })
  fetchCharacters()
}

const handleSortChange = () => {
  characterStore.updateFilters({
    sortBy: sortBy.value,
    order: sortOrder.value,
  })
  fetchCharacters()
}

const handlePaginationChange = (params) => {
  characterStore.updatePagination(params)
  fetchCharacters()
}

const refreshList = () => {
  fetchCharacters()
  characterStore.fetchStats()
}

const goToDetail = (id) => {
  router.push({ name: 'CharacterDetail', params: { id } })
}

const editCharacter = (character) => {
  router.push({ name: 'CharacterEdit', params: { id: character._id } })
}

const showCreateDialog = () => {
  router.push({ name: 'CharacterCreate' })
}

const handleStarChange = async (characterId, star) => {
  try {
    await characterStore.updateCharacterStar(characterId, star)
    ElMessage.success('评分更新成功')
  } catch (error) {
    ElMessage.error('评分更新失败', error)
  }
}

const handleRowClick = (row) => {
  goToDetail(row._id)
}

const handleBatchUpdate = async () => {
  // 实现批量更新逻辑
  batchDialogVisible.value = false
}
</script>

<style scoped>
.character-list {
  padding: 20px;
  background-color: var(--bg-color-secondary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-card {
  background: var(--bg-color);
  border-color: var(--border-color);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.filter-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.filter-row .el-input {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-section :deep(.el-statistic) {
  background-color: var(--bg-color);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stats-section :deep(.el-statistic.dark-statistic) {
  background-color: var(--bg-color-secondary);
}

.stats-section :deep(.el-statistic__head) {
  color: var(--text-secondary-color);
  font-size: 14px;
}

.stats-section :deep(.el-statistic__number) {
  color: var(--text-primary-color);
  font-size: 24px;
  font-weight: bold;
}

.list-section {
  margin-top: 20px;
}

.list-section .el-card {
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.list-section .el-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.list-section :deep(.el-card__header) {
  background-color: var(--bg-color-secondary);
  border-bottom-color: var(--border-color);
  padding: 16px 20px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.character-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.character-card:hover {
  transform: translateY(-4px);
}

.character-card:hover .character-item {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.character-item {
  height: 100%;
  border-color: var(--border-color);
  background-color: var(--bg-color);
  transition: all 0.3s ease;
}

.character-item.dark-card {
  background-color: var(--bg-color-tertiary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-name {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.character-info {
  padding: 10px 0;
}

.star-section {
  margin-bottom: 10px;
}

.tags-section {
  margin-bottom: 10px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.tag-item:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.meta-info {
  font-size: 12px;
  color: var(--text-secondary-color);
  transition: color 0.3s ease;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}

.character-table {
  margin-bottom: 20px;
}

.character-table :deep(.el-table) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: background-color 0.3s ease;
}

.character-table :deep(.el-table.dark-table) {
  background-color: var(--bg-color-secondary);
}

.character-table :deep(.el-table__header-wrapper) {
  background-color: var(--bg-color-secondary);
}

.character-table :deep(.el-table__row) {
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.character-table :deep(.el-table__row:hover) {
  background-color: var(--hover-bg-color);
}

.character-table :deep(.el-table th.el-table__cell) {
  background-color: var(--bg-color-secondary);
  color: var(--text-primary-color);
  border-bottom-color: var(--border-color);
}

.character-table :deep(.el-table td.el-table__cell) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary-color);
}

.character-table :deep(.el-table .cell) {
  color: var(--text-primary-color);
}

.character-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.character-name-cell .name {
  color: var(--text-primary-color);
  font-weight: 500;
}

.names-like {
  display: flex;
  flex-wrap: wrap;
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
}

.batch-dialog {
  padding: 10px 0;
}

/* 按钮样式优化 */
:deep(.el-button) {
  transition: all 0.3s ease;
}

:deep(.el-button.dark-btn) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

:deep(.el-button.dark-btn:hover) {
  background-color: var(--bg-color-tertiary);
  border-color: var(--primary-color);
}

.active-btn {
  background-color: var(--primary-color);
  color: white;
}

.active-btn:hover {
  background-color: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
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

:deep(.el-input.dark-input .el-input__prefix .el-icon) {
  color: var(--text-secondary-color);
}

:deep(.el-select.dark-select .el-input__wrapper) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  box-shadow: none;
}

:deep(.el-select.dark-select .el-input__inner) {
  color: var(--text-primary-color);
}

/* 分页组件暗色主题 */
:deep(.el-pagination.dark-pagination) {
  color: var(--text-primary-color);
}

:deep(.el-pagination.dark-pagination .btn-next),
:deep(.el-pagination.dark-pagination .btn-prev) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

:deep(.el-pagination.dark-pagination .el-pager li) {
  background-color: var(--bg-color-secondary);
  color: var(--text-primary-color);
  border-color: var(--border-color);
}

:deep(.el-pagination.dark-pagination .el-pager li.active) {
  background-color: var(--primary-color);
  color: white;
}

/* 对话框样式覆盖 */
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

:deep(.el-form-item__label) {
  color: var(--text-secondary-color);
}

:deep(.el-select .el-input__inner) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .character-list {
    padding: 10px;
  }

  .filter-row {
    flex-direction: column;
    gap: 10px;
  }

  .filter-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-actions .el-select {
    flex: 1;
    min-width: 120px;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* 加载动画 */
:deep(.el-loading-mask) {
  background-color: var(--bg-color);
}

:deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
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

<style>
/* 全局样式覆盖，确保Element Plus组件在暗色主题下正确显示 */
.el-statistic.dark-statistic .el-statistic__head {
  color: var(--text-secondary-color);
}

.el-statistic.dark-statistic .el-statistic__number {
  color: var(--text-primary-color);
}

.el-table.dark-table .el-table__header {
  background-color: var(--bg-color-secondary);
}

.el-table.dark-table .el-table__body {
  background-color: var(--bg-color);
}

.el-table.dark-table .el-table__row {
  background-color: var(--bg-color);
}

.el-table.dark-table .el-table__row:hover {
  background-color: var(--hover-bg-color);
}

.el-pagination.dark-pagination {
  --el-pagination-bg-color: var(--bg-color-secondary);
  --el-pagination-button-bg-color: var(--bg-color-secondary);
  --el-pagination-button-color: var(--text-primary-color);
  --el-pagination-button-disabled-bg-color: var(--bg-color-tertiary);
  --el-pagination-button-disabled-color: var(--text-disabled-color);
  --el-pagination-hover-color: var(--primary-color);
}

.el-pagination.dark-pagination .el-pagination__total,
.el-pagination.dark-pagination .el-pagination__jump {
  color: var(--text-secondary-color);
}
</style>
