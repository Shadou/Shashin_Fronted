<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <div class="search-header">
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索角色、图片集、标签..."
          size="large"
          @keyup.enter="performSearch"
          clearable
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="search-filters">
          <el-select
            v-model="searchType"
            placeholder="搜索类型"
            size="large"
            style="width: 120px; margin-left: 10px"
          >
            <el-option label="全部" value="all" />
            <el-option label="角色" value="character" />
            <el-option label="Xwang" value="xwang" />
            <el-option label="Cosergirl" value="cosergirl" />
          </el-select>

          <el-button type="primary" size="large" @click="performSearch" :loading="loading">
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="showResults" class="search-results">
      <div class="results-stats">
        <el-tag type="info" size="large">
          找到 {{ totalResults }} 个结果 ({{ searchTime }}ms)
        </el-tag>
      </div>

      <!-- 结果标签页 -->
      <el-tabs v-model="activeTab" class="results-tabs">
        <!-- 角色结果 -->
        <el-tab-pane label="角色" name="characters" v-if="characterResults.length > 0">
          <div class="results-grid">
            <div
              v-for="character in characterResults"
              :key="character._id"
              class="result-item"
              @click="viewCharacter(character._id)"
            >
              <el-card shadow="hover">
                <div class="character-result">
                  <div class="character-header">
                    <h3 class="character-name">{{ character.name }}</h3>
                    <StarRating :star="character.star" size="small" />
                  </div>

                  <div class="character-meta">
                    <AgeRatingTag :rating="character.age_rating" />

                    <div class="character-tags" v-if="character.tags && character.tags.length">
                      <el-tag v-for="tag in character.tags.slice(0, 3)" :key="tag" size="small">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="character-info">
                    <div class="info-row">
                      <el-icon><Collection /></el-icon>
                      <span>相似名称:</span>
                      <span class="info-value">{{ character.names_like?.join(', ') || '无' }}</span>
                    </div>

                    <div class="info-row">
                      <el-icon><Calendar /></el-icon>
                      <span>更新时间:</span>
                      <span class="info-value">{{ formatDate(character.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- Xwang结果 -->
        <el-tab-pane label="Xwang" name="xwang" v-if="xwangResults.length > 0">
          <div class="results-grid gallery-grid">
            <div
              v-for="item in xwangResults"
              :key="item._id"
              class="result-item"
              @click="viewXwang(item._id)"
            >
              <el-card shadow="hover">
                <div class="gallery-result">
                  <div class="gallery-cover">
                    <el-image
                      :src="getXwangCover(item)"
                      fit="cover"
                      class="cover-image"
                      loading="lazy"
                    >
                      <template #placeholder>
                        <div class="cover-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>

                  <div class="gallery-info">
                    <h3 class="gallery-title">{{ truncateText(item.title, 40) }}</h3>

                    <div class="gallery-meta">
                      <div class="meta-item">
                        <el-icon><User /></el-icon>
                        <span>{{ item.character }}</span>
                      </div>

                      <div class="meta-item">
                        <el-icon><Picture /></el-icon>
                        <span>{{ item.count }} 张</span>
                      </div>

                      <StarRating :star="item.star" size="small" />
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- Cosergirl结果 -->
        <el-tab-pane label="Cosergirl" name="cosergirl" v-if="cosergirlResults.length > 0">
          <div class="results-grid gallery-grid">
            <div
              v-for="item in cosergirlResults"
              :key="item._id"
              class="result-item"
              @click="viewCosergirl(item._id)"
            >
              <el-card shadow="hover">
                <div class="gallery-result">
                  <div class="gallery-cover">
                    <el-image
                      :src="getCosergirlCover(item)"
                      fit="cover"
                      class="cover-image"
                      loading="lazy"
                    >
                      <template #placeholder>
                        <div class="cover-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>

                  <div class="gallery-info">
                    <h3 class="gallery-title">{{ truncateText(item.title, 40) }}</h3>

                    <div class="gallery-meta">
                      <div class="meta-item">
                        <el-icon><User /></el-icon>
                        <span>{{ item.character }}</span>
                      </div>

                      <div class="meta-item">
                        <el-icon><Picture /></el-icon>
                        <span>{{ item.count }} 张</span>
                      </div>

                      <StarRating :star="item.star" size="small" />
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 搜索提示 -->
    <div v-else class="search-tips">
      <div class="tips-header">
        <h2>搜索提示</h2>
      </div>

      <div class="tips-content">
        <div class="tips-section">
          <h3>搜索语法</h3>
          <ul class="tips-list">
            <li>直接输入角色名进行搜索</li>
            <li>使用引号进行精确搜索: <code>"角色名称"</code></li>
            <li>使用 AND/OR 进行逻辑搜索: <code>角色1 AND 角色2</code></li>
            <li>排除关键词: <code>角色 -排除词</code></li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>热门搜索</h3>
          <div class="hot-searches">
            <el-tag
              v-for="tag in hotSearches"
              :key="tag"
              size="large"
              class="hot-tag"
              @click="setSearchKeyword(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="tips-section">
          <h3>最近搜索</h3>
          <div class="recent-searches">
            <el-tag
              v-for="search in recentSearches"
              :key="search"
              size="large"
              type="info"
              class="recent-tag"
              @click="setSearchKeyword(search)"
              closable
              @close="removeRecentSearch(search)"
            >
              {{ search }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Collection, Calendar, Picture, User } from '@element-plus/icons-vue'

import { characterApi } from '@/api/character'
import { xwangApi } from '@/api/xwang'
import { cosergirlApi } from '@/api/cosergirl'
import { formatDate } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'
import AgeRatingTag from '@/components/common/AgeRatingTag.vue'

const route = useRoute()
const router = useRouter()

// 搜索状态
const searchKeyword = ref('')
const searchType = ref('all')
const loading = ref(false)
const showResults = ref(false)
const activeTab = ref('characters')
const searchTime = ref(0)

// 搜索结果
const characterResults = ref([])
const xwangResults = ref([])
const cosergirlResults = ref([])
const totalResults = computed(
  () => characterResults.value.length + xwangResults.value.length + cosergirlResults.value.length,
)

// 搜索提示
const hotSearches = ref(['可爱', '萝莉', '御姐', '学生', '女仆'])
const recentSearches = ref([])

// 计算属性
const shouldShowCharactersTab = computed(() => {
  return searchType.value === 'all' || searchType.value === 'character'
})

const shouldShowXwangTab = computed(() => {
  return searchType.value === 'all' || searchType.value === 'xwang'
})

const shouldShowCosergirlTab = computed(() => {
  return searchType.value === 'all' || searchType.value === 'cosergirl'
})

// 生命周期
onMounted(() => {
  loadRecentSearches()

  // 从URL参数中获取搜索关键词
  if (route.query.q) {
    searchKeyword.value = route.query.q
    performSearch()
  }
})

// 方法
const performSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  showResults.value = true

  const startTime = Date.now()

  try {
    // 保存搜索记录
    saveSearch(searchKeyword.value)

    // 并行执行搜索
    const searchPromises = []

    if (shouldShowCharactersTab.value) {
      searchPromises.push(
        characterApi
          .getCharacters({ search: searchKeyword.value, limit: 20 })
          .then((response) => {
            characterResults.value = response.data || []
          })
          .catch((error) => {
            console.error('角色搜索失败:', error)
            characterResults.value = []
          }),
      )
    }

    if (shouldShowXwangTab.value) {
      searchPromises.push(
        xwangApi
          .getXwang({ search: searchKeyword.value, limit: 20 })
          .then((response) => {
            xwangResults.value = response.data || []
          })
          .catch((error) => {
            console.error('Xwang搜索失败:', error)
            xwangResults.value = []
          }),
      )
    }

    if (shouldShowCosergirlTab.value) {
      searchPromises.push(
        cosergirlApi
          .getCosergirl({ search: searchKeyword.value, limit: 20 })
          .then((response) => {
            cosergirlResults.value = response.data || []
          })
          .catch((error) => {
            console.error('Cosergirl搜索失败:', error)
            cosergirlResults.value = []
          }),
      )
    }

    await Promise.allSettled(searchPromises)

    // 设置活动标签页
    if (characterResults.value.length > 0) {
      activeTab.value = 'characters'
    } else if (xwangResults.value.length > 0) {
      activeTab.value = 'xwang'
    } else if (cosergirlResults.value.length > 0) {
      activeTab.value = 'cosergirl'
    }
  } catch (error) {
    ElMessage.error('搜索失败: ' + error.message)
  } finally {
    loading.value = false
    searchTime.value = Date.now() - startTime
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  showResults.value = false
  characterResults.value = []
  xwangResults.value = []
  cosergirlResults.value = []
}

const saveSearch = (keyword) => {
  // 从本地存储加载最近的搜索记录
  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')

  // 移除重复的
  const filtered = recent.filter((item) => item !== keyword)

  // 添加到开头
  filtered.unshift(keyword)

  // 限制数量
  const limited = filtered.slice(0, 10)

  // 保存
  localStorage.setItem('recentSearches', JSON.stringify(limited))
  recentSearches.value = limited
}

const loadRecentSearches = () => {
  const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
  recentSearches.value = recent
}

const removeRecentSearch = (keyword) => {
  const recent = recentSearches.value.filter((item) => item !== keyword)
  localStorage.setItem('recentSearches', JSON.stringify(recent))
  recentSearches.value = recent
}

const setSearchKeyword = (keyword) => {
  searchKeyword.value = keyword
  performSearch()
}

const getXwangCover = (item) => {
  if (!item.images || item.images.length === 0) return ''
  return `/api/files/xwang/${item.xid}/${item.images[0][0]}`
}

const getCosergirlCover = (item) => {
  if (!item.images || item.images.length === 0) return ''
  return cosergirlApi.buildImageUrl(item, item.images[0][0])
}

const viewCharacter = (id) => {
  router.push({ name: 'CharacterDetail', params: { id } })
}

const viewXwang = (id) => {
  router.push({ name: 'XwangDetail', params: { id } })
}

const viewCosergirl = (id) => {
  router.push({ name: 'CosergirlDetail', params: { id } })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.search-page {
  padding: 20px;
}

.search-header {
  margin-bottom: 40px;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-results {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.results-stats {
  margin-bottom: 20px;
  text-align: center;
}

.results-tabs {
  margin-top: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.result-item {
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  transform: translateY(-4px);
}

.character-result {
  padding: 16px;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.character-name {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.character-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-row .el-icon {
  color: #999;
}

.info-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.gallery-result {
  display: flex;
  flex-direction: column;
}

.gallery-cover {
  width: 100%;
  height: 150px;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
}

.gallery-info {
  padding: 16px;
}

.gallery-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.gallery-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.search-tips {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tips-header {
  text-align: center;
  margin-bottom: 30px;
}

.tips-header h2 {
  margin: 0;
  color: #333;
}

.tips-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.tips-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e96900;
}

.hot-searches,
.recent-searches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag,
.recent-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-tag:hover,
.recent-tag:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filters {
    justify-content: center;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .tips-content {
    grid-template-columns: 1fr;
  }
}
</style>
