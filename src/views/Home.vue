<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card" :class="{ 'dark-welcome-card': isDarkTheme }">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">欢迎来到 Coser Gallery</h1>
            <p class="welcome-description">
              专业的Cosplay图片管理系统，为您提供最佳的图片管理和浏览体验
            </p>
          </div>

          <div class="welcome-stats">
            <div class="stat-item">
              <div class="stat-value">{{ characterCount }}</div>
              <div class="stat-label">角色数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ xwangCount }}</div>
              <div class="stat-label">Xwang图集</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ cosergirlCount }}</div>
              <div class="stat-label">Cosergirl图集</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalImages }}</div>
              <div class="stat-label">总图片数</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions-section">
      <h2 class="section-title">快速操作</h2>

      <div class="actions-grid">
        <el-card
          class="action-card"
          shadow="hover"
          @click="goToCharacters"
          :class="{ 'dark-card': isDarkTheme }"
        >
          <div class="action-content">
            <el-icon class="action-icon"><User /></el-icon>
            <div class="action-info">
              <h3 class="action-title">角色管理</h3>
              <p class="action-description">管理所有角色信息、评分和分级</p>
            </div>
          </div>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="goToXwang"
          :class="{ 'dark-card': isDarkTheme }"
        >
          <div class="action-content">
            <el-icon class="action-icon"><Picture /></el-icon>
            <div class="action-info">
              <h3 class="action-title">Xwang图库</h3>
              <p class="action-description">浏览和管理Xwang图片集</p>
            </div>
          </div>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="goToCosergirl"
          :class="{ 'dark-card': isDarkTheme }"
        >
          <div class="action-content">
            <el-icon class="action-icon"><Collection /></el-icon>
            <div class="action-info">
              <h3 class="action-title">Cosergirl图库</h3>
              <p class="action-description">浏览和管理Cosergirl图片集</p>
            </div>
          </div>
        </el-card>

        <el-card
          class="action-card"
          shadow="hover"
          @click="goToStats"
          :class="{ 'dark-card': isDarkTheme }"
        >
          <div class="action-content">
            <el-icon class="action-icon"><DataAnalysis /></el-icon>
            <div class="action-info">
              <h3 class="action-title">数据统计</h3>
              <p class="action-description">查看系统数据统计和分析</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 最近更新 -->
    <div class="recent-updates-section">
      <h2 class="section-title">最近更新</h2>

      <el-tabs v-model="activeTab" class="updates-tabs" :class="{ 'dark-tabs': isDarkTheme }">
        <el-tab-pane label="最新角色" name="characters">
          <div v-if="recentCharacters.length > 0" class="updates-grid">
            <div
              v-for="character in recentCharacters"
              :key="character._id"
              class="update-item"
              @click="goToCharacterDetail(character._id)"
            >
              <el-card shadow="hover" :class="{ 'dark-card': isDarkTheme }">
                <div class="update-content">
                  <div class="update-header">
                    <span class="update-name">{{ character.name }}</span>
                    <StarRating :star="character.star" size="small" />
                  </div>

                  <div class="update-info">
                    <div class="update-tags">
                      <el-tag
                        v-for="tag in character.tags?.slice(0, 2)"
                        :key="tag"
                        size="small"
                        class="tag-item"
                        :class="{ 'dark-tag': isDarkTheme }"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>

                    <div class="update-time">
                      {{ formatDate(character.updated_at) }}
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-empty description="暂无最近更新的角色" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="最新图集" name="galleries">
          <div v-if="recentGalleries.length > 0" class="updates-grid">
            <div
              v-for="gallery in recentGalleries"
              :key="gallery._id"
              class="update-item"
              @click="goToGalleryDetail(gallery)"
            >
              <el-card shadow="hover" :class="{ 'dark-card': isDarkTheme }">
                <div class="gallery-update">
                  <div class="gallery-cover">
                    <el-image
                      :src="getGalleryCover(gallery)"
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
                    <div class="gallery-type">
                      <el-tag size="small" :type="gallery.xid ? 'success' : 'warning'">
                        {{ gallery.xid ? 'Xwang' : 'Cosergirl' }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="gallery-info">
                    <div class="gallery-title" :title="gallery.title">
                      {{ truncateText(gallery.title, 40) }}
                    </div>
                    <div class="gallery-meta">
                      <span class="meta-item">{{ gallery.character }}</span>
                      <span class="meta-item">{{ gallery.count }}张</span>
                      <span class="meta-item">{{ formatDate(gallery.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-empty description="暂无最近更新的图集" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 系统状态 -->
    <div class="system-status-section">
      <h2 class="section-title">系统状态</h2>

      <div class="status-grid">
        <el-card class="status-card" :class="{ 'dark-card': isDarkTheme }">
          <div class="status-header">
            <el-icon><Cpu /></el-icon>
            <span>系统负载</span>
          </div>
          <div class="status-content">
            <el-progress
              :percentage="systemStatus.cpu"
              :color="getStatusColor(systemStatus.cpu)"
              :show-text="false"
            />
            <div class="status-value">{{ systemStatus.cpu }}%</div>
          </div>
        </el-card>

        <el-card class="status-card" :class="{ 'dark-card': isDarkTheme }">
          <div class="status-header">
            <el-icon><Box /></el-icon>
            <span>存储空间</span>
          </div>
          <div class="status-content">
            <el-progress
              :percentage="systemStatus.disk"
              :color="getStatusColor(systemStatus.disk)"
              :show-text="false"
            />
            <div class="status-value">{{ systemStatus.disk }}%</div>
          </div>
        </el-card>

        <el-card class="status-card" :class="{ 'dark-card': isDarkTheme }">
          <div class="status-header">
            <el-icon><Connection /></el-icon>
            <span>API状态</span>
          </div>
          <div class="status-content">
            <el-tag :type="systemStatus.api ? 'success' : 'danger'" effect="dark">
              {{ systemStatus.api ? '正常' : '异常' }}
            </el-tag>
            <div class="status-value">{{ systemStatus.responseTime }}ms</div>
          </div>
        </el-card>

        <el-card class="status-card" :class="{ 'dark-card': isDarkTheme }">
          <div class="status-header">
            <el-icon><Refresh /></el-icon>
            <span>数据同步</span>
          </div>
          <div class="status-content">
            <div class="sync-status">
              <el-tag :type="systemStatus.sync ? 'success' : 'warning'" effect="plain">
                {{ systemStatus.sync ? '已同步' : '同步中' }}
              </el-tag>
            </div>
            <div class="status-value">上次同步：{{ systemStatus.lastSync }}</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import {
  User,
  Picture,
  Collection,
  DataAnalysis,
  Cpu,
  Box, // 替代 HardDrive
  Connection,
  Refresh, // 替代 TrendCharts
} from '@element-plus/icons-vue'

import { characterApi } from '@/api/character'
import { xwangApi } from '@/api/xwang'
import { cosergirlApi } from '@/api/cosergirl'
import { formatDate } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'

const router = useRouter()
const themeStore = useThemeStore()

// 计算属性
const isDarkTheme = computed(() => themeStore.theme === 'dark')

// 状态
const characterCount = ref(0)
const xwangCount = ref(0)
const cosergirlCount = ref(0)
const totalImages = ref(0)
const activeTab = ref('characters')
const recentCharacters = ref([])
const recentGalleries = ref([])
const systemStatus = ref({
  cpu: 45,
  disk: 68,
  memory: 72,
  api: true,
  responseTime: 128,
  sync: true,
  lastSync: '2小时前',
})

// 生命周期
onMounted(async () => {
  await loadStats()
  await loadRecentUpdates()
  await checkSystemStatus()
})

// 方法
const loadStats = async () => {
  try {
    // 获取角色统计
    const charResponse = await characterApi.getCharacters({ limit: 1 })
    characterCount.value = charResponse.pagination?.total || 0

    // 获取Xwang统计
    const xwangResponse = await xwangApi.getXwang({ limit: 1 })
    xwangCount.value = xwangResponse.pagination?.total || 0

    // 获取Cosergirl统计
    const cosergirlResponse = await cosergirlApi.getCosergirl({ limit: 1 })
    cosergirlCount.value = cosergirlResponse.pagination?.total || 0

    // 估算总图片数
    totalImages.value = xwangCount.value * 50 + cosergirlCount.value * 100
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadRecentUpdates = async () => {
  try {
    // 获取最近更新的角色
    const charResponse = await characterApi.getCharacters({
      limit: 8,
      sortBy: 'updated_at',
      order: 'desc',
    })
    recentCharacters.value = charResponse.data || []

    // 获取最近更新的Xwang
    const xwangResponse = await xwangApi.getXwang({
      limit: 4,
      sortBy: 'updated_at',
      order: 'desc',
    })

    // 获取最近更新的Cosergirl
    const cosergirlResponse = await cosergirlApi.getCosergirl({
      limit: 4,
      sortBy: 'updated_at',
      order: 'desc',
    })

    // 合并图集数据
    const xwangItems = (xwangResponse.data || []).map((item) => ({ ...item, type: 'xwang' }))
    const cosergirlItems = (cosergirlResponse.data || []).map((item) => ({
      ...item,
      type: 'cosergirl',
    }))

    recentGalleries.value = [...xwangItems, ...cosergirlItems]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8)
  } catch (error) {
    console.error('加载最近更新失败:', error)
  }
}

const checkSystemStatus = async () => {
  try {
    // 模拟系统状态检查
    systemStatus.value = {
      cpu: Math.floor(Math.random() * 30) + 40,
      disk: Math.floor(Math.random() * 30) + 40,
      memory: Math.floor(Math.random() * 30) + 50,
      api: true,
      responseTime: Math.floor(Math.random() * 50) + 100,
      sync: true,
      lastSync: '2小时前',
    }
  } catch (error) {
    console.error('检查系统状态失败:', error)
  }
}

const getGalleryCover = (gallery) => {
  if (gallery.type === 'xwang') {
    if (!gallery.images || gallery.images.length === 0) return ''
    return `/api/files/xwang/${gallery.xid}/${gallery.images[0][0]}`
  } else {
    if (!gallery.images || gallery.images.length === 0) return ''
    return cosergirlApi.buildImageUrl(gallery, gallery.images[0][0])
  }
}

const goToCharacters = () => {
  router.push('/characters')
}

const goToXwang = () => {
  router.push('/xwang')
}

const goToCosergirl = () => {
  router.push('/cosergirl')
}

const goToStats = () => {
  router.push('/stats')
}

const goToCharacterDetail = (id) => {
  router.push({ name: 'CharacterDetail', params: { id } })
}

const goToGalleryDetail = (gallery) => {
  if (gallery.type === 'xwang') {
    router.push({ name: 'XwangDetail', params: { id: gallery._id } })
  } else {
    router.push({ name: 'CosergirlDetail', params: { id: gallery._id } })
  }
}

const getStatusColor = (percentage) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: var(--bg-color-secondary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.welcome-card.dark-welcome-card {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
}

.welcome-text {
  flex: 1;
  min-width: 300px;
}

.welcome-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.welcome-description {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.welcome-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.8);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.quick-actions-section {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.action-card.dark-card {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  font-size: 40px;
  color: var(--primary-color);
  transition: color 0.3s ease;
}

.action-info {
  flex: 1;
}

.action-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.action-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary-color);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.recent-updates-section {
  margin-bottom: 40px;
}

.updates-tabs {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.updates-tabs.dark-tabs {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

.updates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.update-item {
  cursor: pointer;
}

.update-item .el-card {
  height: 100%;
  transition: all 0.3s;
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

.update-item .el-card.dark-card {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

.update-item .el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.update-content {
  padding: 16px;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.update-name {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.update-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag-item {
  transition: all 0.3s ease;
}

.tag-item.dark-tag {
  background-color: var(--bg-color-tertiary);
  color: var(--text-primary-color);
  border-color: var(--border-color);
}

.update-time {
  font-size: 12px;
  color: var(--text-tertiary-color);
  transition: color 0.3s ease;
}

.gallery-update {
  display: flex;
  gap: 16px;
}

.gallery-cover {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  color: var(--text-tertiary-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.gallery-type {
  position: absolute;
  top: 4px;
  right: 4px;
}

.gallery-info {
  flex: 1;
  min-width: 0;
}

.gallery-title {
  font-weight: bold;
  font-size: 14px;
  color: var(--text-primary-color);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

.gallery-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary-color);
  transition: color 0.3s ease;
}

.meta-item {
  background-color: var(--bg-color-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
}

.system-status-section {
  margin-bottom: 40px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.status-card {
  height: 100%;
  background-color: var(--bg-color);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.status-card.dark-card {
  background-color: var(--bg-color-secondary);
  border-color: var(--border-color);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: bold;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.status-header .el-icon {
  font-size: 20px;
  color: var(--primary-color);
  transition: color 0.3s ease;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-content .el-progress {
  flex: 1;
}

.status-value {
  font-size: 14px;
  color: var(--text-secondary-color);
  min-width: 80px;
  transition: color 0.3s ease;
}

.sync-status {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .welcome-stats {
    justify-content: center;
  }

  .actions-grid,
  .updates-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .gallery-update {
    flex-direction: column;
    text-align: center;
  }

  .gallery-cover {
    width: 100%;
    height: 120px;
  }
}

/* 暗色模式特定样式 */
:deep(.el-empty__description p) {
  color: var(--text-secondary-color);
}

:deep(.el-tabs__item) {
  color: var(--text-secondary-color);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}
</style>
