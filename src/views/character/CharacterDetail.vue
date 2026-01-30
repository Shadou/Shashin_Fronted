<template>
  <div class="character-detail" v-loading="loading">
    <div class="detail-container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button type="text" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <!-- 角色信息卡片 -->
      <el-card class="character-card" :class="{ 'dark-card': isDarkTheme }">
        <template #header>
          <div class="header-content">
            <div class="title-section">
              <h1 class="character-name">{{ character.name }}</h1>
              <div class="title-actions">
                <el-button type="primary" @click="editCharacter">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" @click="deleteCharacter">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </template>

        <div class="character-content">
          <!-- 基本信息 -->
          <div class="info-section">
            <h3>基本信息</h3>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="info-item">
                  <span class="info-label">角色名称:</span>
                  <span class="info-value">{{ character.name }}</span>
                </div>
              </el-col>

              <el-col :span="8">
                <div class="info-item">
                  <span class="info-label">年龄分级:</span>
                  <AgeRatingTag :rating="character.age_rating" />
                </div>
              </el-col>

              <el-col :span="8">
                <div class="info-item">
                  <span class="info-label">评分:</span>
                  <StarRating :star="character.star" @change="updateStar" />
                </div>
              </el-col>
            </el-row>

            <div class="info-item">
              <span class="info-label">相似名称:</span>
              <div class="names-like">
                <el-tag
                  v-for="name in character.names_like"
                  :key="name"
                  class="name-tag"
                  size="large"
                  type="info"
                >
                  {{ name }}
                </el-tag>
                <el-tag
                  v-if="!character.names_like || character.names_like.length === 0"
                  class="name-tag"
                  size="large"
                  type="info"
                >
                  无
                </el-tag>
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">标签:</span>
              <div class="character-tags">
                <el-tag
                  v-for="tag in character.tags"
                  :key="tag"
                  class="tag-item"
                  size="large"
                  :type="getTagType(tag)"
                  closable
                  @close="removeTag(tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-button type="text" @click="showAddTagDialog" class="add-tag-button">
                  <el-icon><Plus /></el-icon>
                  添加标签
                </el-button>
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">备注:</span>
              <div class="character-remark">
                {{ character.remark || '无备注' }}
              </div>
            </div>

            <div class="info-item">
              <span class="info-label">创建时间:</span>
              <span class="info-value">{{ formatDate(character.created_at) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span class="info-value">{{ formatDate(character.updated_at) }}</span>
            </div>
          </div>

          <!-- 相关数据 -->
          <div class="related-section">
            <h3>相关图集</h3>

            <el-tabs v-model="relatedTab" class="related-tabs">
              <!-- Xwang图集 -->
              <el-tab-pane label="Xwang图集" name="xwang">
                <div v-if="xwangItems.length > 0" class="related-grid">
                  <div
                    v-for="item in xwangItems"
                    :key="item._id"
                    class="related-item"
                    @click="viewXwang(item._id)"
                  >
                    <el-card shadow="hover" :class="{ 'dark-card': isDarkTheme }">
                      <div class="related-content">
                        <!-- 封面容器 -->
                        <div class="related-cover">
                          <el-image
                            :src="getXwangCover(item)"
                            :fit="getImageFit(item, 'xwang')"
                            class="cover-image"
                            loading="lazy"
                            @load="handleImageLoad(item, 'xwang', $event)"
                          >
                            <template #placeholder>
                              <div class="cover-placeholder">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                            <template #error>
                              <div class="cover-placeholder">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                          </el-image>

                          <!-- 悬停覆盖层 -->
                          <div class="cover-hover-overlay">
                            <div class="overlay-content">
                              <div class="overlay-title">{{ truncateText(item.title, 20) }}</div>
                              <div class="overlay-meta">
                                <span class="overlay-character">{{ item.character }}</span>
                                <span class="overlay-count">{{ item.count }}P</span>
                              </div>
                            </div>
                          </div>

                          <!-- 图片数量标签 -->
                          <div class="cover-badge">
                            <span class="badge-number">{{ item.count }}</span>
                            <el-icon><Picture /></el-icon>
                          </div>

                          <!-- 评分 -->
                          <div class="cover-rating">
                            <StarRating :star="item.star" size="mini" />
                          </div>

                          <!-- Xwang ID -->
                          <div class="cover-xid">
                            <span class="xid-text">{{ item.xid }}</span>
                          </div>
                        </div>

                        <!-- 简略信息 -->
                        <div class="related-info">
                          <div class="related-title">{{ truncateText(item.title, 20) }}</div>
                          <div class="related-meta">
                            <span>{{ formatFileSize(item.size) }}</span>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </div>

                <div v-else class="empty-related">
                  <el-empty description="暂无相关的Xwang图集" />
                </div>
              </el-tab-pane>

              <!-- Cosergirl图集 -->
              <el-tab-pane label="Cosergirl图集" name="cosergirl">
                <div v-if="cosergirlItems.length > 0" class="related-grid">
                  <div
                    v-for="item in cosergirlItems"
                    :key="item._id"
                    class="related-item"
                    @click="viewCosergirl(item._id)"
                  >
                    <el-card shadow="hover" :class="{ 'dark-card': isDarkTheme }">
                      <div class="related-content">
                        <!-- 封面容器 -->
                        <div class="related-cover">
                          <el-image
                            :src="getCosergirlCover(item)"
                            :fit="getImageFit(item, 'cosergirl')"
                            class="cover-image"
                            loading="lazy"
                            @load="handleImageLoad(item, 'cosergirl', $event)"
                          >
                            <template #placeholder>
                              <div class="cover-placeholder">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                            <template #error>
                              <div class="cover-placeholder">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                          </el-image>

                          <!-- 悬停覆盖层 -->
                          <div class="cover-hover-overlay">
                            <div class="overlay-content">
                              <div class="overlay-title">{{ truncateText(item.title, 20) }}</div>
                              <div class="overlay-meta">
                                <span class="overlay-character">{{ item.character }}</span>
                                <span class="overlay-count">{{ item.count }}P</span>
                              </div>
                            </div>
                          </div>

                          <!-- 图片数量标签 -->
                          <div class="cover-badge">
                            <span class="badge-number">{{ item.count }}</span>
                            <el-icon><Picture /></el-icon>
                          </div>

                          <!-- 评分 -->
                          <div class="cover-rating">
                            <StarRating :star="item.star" size="mini" />
                          </div>
                        </div>

                        <!-- 简略信息 -->
                        <div class="related-info">
                          <div class="related-title">{{ truncateText(item.title, 20) }}</div>
                          <div class="related-meta">
                            <span>{{ formatFileSize(item.size) }}</span>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </div>

                <div v-else class="empty-related">
                  <el-empty description="暂无相关的Cosergirl图集" />
                </div>
              </el-tab-pane>

              <!-- 统计信息 -->
              <el-tab-pane label="统计信息" name="stats">
                <div class="stats-content">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-statistic title="Xwang图集数" :value="xwangItems.length" />
                    </el-col>

                    <el-col :span="6">
                      <el-statistic title="Cosergirl图集数" :value="cosergirlItems.length" />
                    </el-col>

                    <el-col :span="6">
                      <el-statistic title="总图片数" :value="totalImages" />
                    </el-col>

                    <el-col :span="6">
                      <el-statistic title="平均评分" :value="averageStar" :precision="1">
                        <template #prefix>
                          <el-icon><Star /></el-icon>
                        </template>
                      </el-statistic>
                    </el-col>
                  </el-row>

                  <!-- 评分分布 -->
                  <div class="rating-distribution">
                    <h4>评分分布</h4>
                    <div class="distribution-bars">
                      <div
                        v-for="rating in ratingDistribution"
                        :key="rating.level"
                        class="distribution-bar"
                      >
                        <div class="bar-label">{{ rating.label }}</div>
                        <div class="bar-container">
                          <div
                            class="bar-fill"
                            :style="{
                              width: rating.percentage + '%',
                              backgroundColor: getRatingColor(rating.level),
                            }"
                          />
                        </div>
                        <div class="bar-count">{{ rating.count }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 添加标签对话框 -->
    <el-dialog v-model="tagDialogVisible" title="添加标签" width="400px">
      <el-form :model="tagForm">
        <el-form-item label="标签">
          <el-input v-model="tagForm.name" placeholder="输入标签名称" @keyup.enter="addTag" />
        </el-form-item>

        <el-form-item label="标签类型">
          <el-select v-model="tagForm.type" placeholder="选择类型">
            <el-option label="默认" value="default" />
            <el-option label="风格" value="style" />
            <el-option label="属性" value="attribute" />
            <el-option label="场景" value="scene" />
            <el-option label="服装" value="costume" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Delete,
  Plus,
  Star,
  Picture,
  Folder,
  Clock,
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

import { characterApi } from '@/api/character'
import { xwangApi } from '@/api/xwang'
import { cosergirlApi } from '@/api/cosergirl'
import { formatDate, formatFileSize } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'
import AgeRatingTag from '@/components/common/AgeRatingTag.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// 状态
const loading = ref(true)
const character = reactive({})
const relatedTab = ref('xwang')
const tagDialogVisible = ref(false)
const tagForm = reactive({
  name: '',
  type: 'default',
})

// 相关数据
const xwangItems = ref([])
const cosergirlItems = ref([])

// 图片尺寸缓存
const xwangImageSizes = ref({})
const cosergirlImageSizes = ref({})

// 计算属性
const isDarkTheme = computed(() => themeStore.theme === 'dark')

const totalImages = computed(() => {
  const xwangTotal = xwangItems.value.reduce((sum, item) => sum + (item.count || 0), 0)
  const cosergirlTotal = cosergirlItems.value.reduce((sum, item) => sum + (item.count || 0), 0)
  return xwangTotal + cosergirlTotal
})

const averageStar = computed(() => {
  const allItems = [...xwangItems.value, ...cosergirlItems.value]
  const itemsWithStar = allItems.filter((item) => item.star > 0)
  if (itemsWithStar.length === 0) return 0
  const sum = itemsWithStar.reduce((total, item) => total + item.star, 0)
  return sum / itemsWithStar.length
})

const ratingDistribution = computed(() => {
  const starConfig = [
    { level: 0, label: '未收藏', color: '#ccc' },
    { level: 1, label: '一般', color: '#FFD700' },
    { level: 2, label: '还行', color: '#FFA500' },
    { level: 3, label: '不错', color: '#FF6347' },
    { level: 4, label: '很好', color: '#DC143C' },
    { level: 5, label: '最爱', color: '#8B0000' },
  ]

  const allItems = [...xwangItems.value, ...cosergirlItems.value]
  const total = allItems.length || 1

  return starConfig.map((config) => {
    const count = allItems.filter((item) => item.star === config.level).length
    return {
      ...config,
      count,
      percentage: (count / total) * 100,
    }
  })
})

// 生命周期
onMounted(async () => {
  await loadCharacter()
  await loadRelatedData()
})

// 方法
const loadCharacter = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const response = await characterApi.getCharacterById(id)
    Object.assign(character, response.data)
  } catch (error) {
    ElMessage.error('加载角色信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const loadRelatedData = async () => {
  try {
    // 加载Xwang数据
    const xwangResponse = await xwangApi.getXwang({
      character: character.name,
      limit: 50,
    })
    xwangItems.value = xwangResponse.data || []

    // 加载Cosergirl数据
    const cosergirlResponse = await cosergirlApi.getCosergirl({
      character: character.name,
      limit: 50,
    })
    cosergirlItems.value = cosergirlResponse.data || []
  } catch (error) {
    console.error('加载相关数据失败:', error)
  }
}

const updateStar = async (star) => {
  try {
    await characterApi.updateStar(character._id, star)
    character.star = star
    ElMessage.success('评分更新成功')
  } catch (error) {
    ElMessage.error('评分更新失败')
  }
}

const editCharacter = () => {
  router.push({ name: 'CharacterEdit', params: { id: character._id } })
}

const deleteCharacter = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await characterApi.deleteCharacter(character._id)
    ElMessage.success('角色删除成功')
    router.push('/characters')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const goBack = () => {
  router.back()
}

const getXwangCover = (item) => {
  if (!item.images || item.images.length === 0) return ''
  return `/api/files/xwang/${item.xid}/${item.images[0][0]}`
}

const getCosergirlCover = (item) => {
  if (!item.images || item.images.length === 0) return ''
  return cosergirlApi.buildImageUrl(item, item.images[0][0])
}

// 获取图片适应方式
const getImageFit = (item, type) => {
  const imageSizes = type === 'xwang' ? xwangImageSizes.value : cosergirlImageSizes.value
  const size = imageSizes[item._id]
  if (!size) return 'cover'

  // 根据图片宽高比选择不同的fit方式
  const aspectRatio = size.height / size.width
  return aspectRatio > 1.5 ? 'contain' : 'cover'
}

// 图片加载处理
const handleImageLoad = (item, type, event) => {
  if (event.target && event.target.naturalWidth) {
    const imageSizes = type === 'xwang' ? xwangImageSizes.value : cosergirlImageSizes.value
    imageSizes[item._id] = {
      width: event.target.naturalWidth,
      height: event.target.naturalHeight,
    }
  }
}

const viewXwang = (id) => {
  router.push({ name: 'XwangDetail', params: { id } })
}

const viewCosergirl = (id) => {
  router.push({ name: 'CosergirlDetail', params: { id } })
}

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

const getRatingColor = (level) => {
  const colors = [
    '#ccc',
    '#FFD700',
    '#FFA500',
    '#FF6347',
    '#DC143C',
    '#8B0000',
  ]
  return colors[level] || colors[0]
}

const showAddTagDialog = () => {
  tagForm.name = ''
  tagForm.type = 'default'
  tagDialogVisible.value = true
}

const addTag = async () => {
  if (!tagForm.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  if (character.tags && character.tags.includes(tagForm.name)) {
    ElMessage.warning('标签已存在')
    return
  }

  try {
    const updatedTags = character.tags ? [...character.tags, tagForm.name] : [tagForm.name]
    await characterApi.updateCharacter(character._id, {
      tags: updatedTags,
    })

    character.tags = updatedTags
    tagDialogVisible.value = false
    ElMessage.success('标签添加成功')
  } catch (error) {
    ElMessage.error('标签添加失败')
  }
}

const removeTag = async (tag) => {
  try {
    const updatedTags = character.tags.filter((t) => t !== tag)
    await characterApi.updateCharacter(character._id, {
      tags: updatedTags,
    })

    character.tags = updatedTags
    ElMessage.success('标签删除成功')
  } catch (error) {
    ElMessage.error('标签删除失败')
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.character-detail {
  padding: 20px;
  background-color: var(--bg-color-secondary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
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

.character-card {
  margin-bottom: 20px;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.character-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.character-card :deep(.el-card__header) {
  background-color: var(--bg-color-secondary);
  border-bottom-color: var(--border-color);
  padding: 20px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.character-name {
  margin: 0;
  font-size: 28px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.title-actions {
  display: flex;
  gap: 10px;
}

.character-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section,
.related-section {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  transition: border-color 0.3s ease;
}

.info-section:last-child,
.related-section:last-child {
  border-bottom: none;
}

.info-section h3,
.related-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.info-item {
  margin-bottom: 20px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
  color: var(--text-secondary-color);
  margin-right: 10px;
  vertical-align: top;
  transition: color 0.3s ease;
}

.info-value {
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.names-like {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.name-tag {
  cursor: default;
  transition: all 0.3s ease;
}

.character-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.add-tag-button {
  margin-left: 8px;
  color: var(--primary-color);
}

.add-tag-button:hover {
  color: var(--primary-color-hover);
}

.character-remark {
  padding: 12px;
  background-color: var(--bg-color-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  margin-top: 8px;
  color: var(--text-secondary-color);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.related-tabs {
  margin-top: 20px;
}

.related-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom-color: var(--border-color);
}

.related-tabs :deep(.el-tabs__item) {
  color: var(--text-secondary-color);
  transition: color 0.3s ease;
}

.related-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

.related-tabs :deep(.el-tabs__item:hover) {
  color: var(--primary-color-hover);
}

.related-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.related-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  transform: translateY(-4px);
}

.related-item:hover .el-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.related-item .el-card {
  border-color: var(--border-color);
  background-color: var(--bg-color);
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;
}

.related-item .el-card.dark-card {
  background-color: var(--bg-color-secondary);
}

.related-item .el-card:hover {
  border-color: var(--primary-color);
}

.related-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.related-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--bg-color-secondary);
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.related-item:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
  font-size: 32px;
}

/* 悬停覆盖层 */
.cover-hover-overlay {
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

.related-cover:hover .cover-hover-overlay {
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

/* 图片数量标签 */
.cover-badge {
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

.badge-number {
  font-weight: bold;
}

/* 评分 */
.cover-rating {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 5;
}

/* Xwang ID */
.cover-xid {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  z-index: 5;
}

.xid-text {
  font-weight: 500;
}

/* 信息区域 */
.related-info {
  padding: 8px;
  background-color: var(--bg-color);
  transition: background-color 0.3s ease;
}

.related-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.related-meta {
  font-size: 11px;
  color: var(--text-secondary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-related {
  padding: 40px 0;
  text-align: center;
}

.empty-related :deep(.el-empty__description) {
  color: var(--text-secondary-color);
}

.stats-content {
  padding: 20px 0;
}

.stats-content :deep(.el-statistic__head) {
  color: var(--text-secondary-color);
}

.stats-content :deep(.el-statistic__number) {
  color: var(--text-primary-color);
}

.rating-distribution {
  margin-top: 30px;
}

.rating-distribution h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 14px;
  color: var(--text-secondary-color);
  text-align: right;
  transition: color 0.3s ease;
}

.bar-container {
  flex: 1;
  height: 20px;
  background-color: var(--bg-color-secondary);
  border-radius: 10px;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.bar-fill {
  height: 100%;
  transition:
    width 0.3s,
    background-color 0.3s;
}

.bar-count {
  width: 40px;
  font-size: 14px;
  color: var(--text-primary-color);
  text-align: right;
  transition: color 0.3s ease;
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

:deep(.el-input__inner) {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary-color);
}

:deep(.el-select) .el-input__inner {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
  color: var(--text-primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .character-detail {
    padding: 10px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .info-label {
    width: auto;
    display: block;
    margin-bottom: 4px;
  }

  .character-name {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
}

/* 加载动画 */
:deep(.el-loading-mask) {
  background-color: var(--bg-color);
}

:deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
}
</style>

<style>
/* 全局覆盖Element Plus组件的暗色主题样式 */
.el-statistic.dark-statistic .el-statistic__head {
  color: var(--text-secondary-color);
}

.el-statistic.dark-statistic .el-statistic__number {
  color: var(--text-primary-color);
}
</style>
