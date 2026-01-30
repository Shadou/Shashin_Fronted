<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <div class="collapse-button" @click="toggleCollapse">
      <el-icon :size="20">
        <component :is="isCollapsed ? ArrowRight : ArrowLeft" />
      </el-icon>
    </div>

    <!-- Logo区域 -->
    <div class="logo-area" @click="goHome">
      <div class="logo-icon">
        <el-icon :size="24" color="#409EFF"><Picture /></el-icon>
      </div>
      <div class="logo-text" v-if="!isCollapsed">
        <span class="app-name">Coser Gallery</span>
        <span class="app-version">v2.0.0</span>
      </div>
    </div>

    <!-- 菜单区域 -->
    <div class="menu-area">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        @select="handleMenuSelect"
      >
        <!-- 仪表板 -->
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>

        <!-- 角色管理 -->
        <el-sub-menu index="character">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </template>

          <el-menu-item index="/characters">
            <template #title>
              <span class="menu-item-text">所有角色</span>
              <el-badge :value="characterCount" :max="99" class="menu-badge" />
            </template>
          </el-menu-item>

          <el-menu-item index="/characters/create">
            <el-icon><Plus /></el-icon>
            <template #title>创建角色</template>
          </el-menu-item>

          <el-menu-item-group title="快速筛选">
            <el-menu-item
              v-for="rating in ageRatingOptions"
              :key="rating.value"
              :index="`/characters/filter/age-rating/${rating.value}`"
            >
              <span class="menu-item-text">{{ rating.label }}</span>
              <el-badge :value="getRatingCount(rating.value)" :max="99" class="menu-badge" />
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 图库 -->
        <el-sub-menu index="gallery">
          <template #title>
            <el-icon><PictureFilled /></el-icon>
            <span>图库</span>
          </template>

          <el-menu-item index="/xwang">
            <template #title>
              <span class="menu-item-text">Xwang图库</span>
              <el-badge :value="xwangCount" :max="999" class="menu-badge" />
            </template>
          </el-menu-item>

          <el-menu-item index="/cosergirl">
            <template #title>
              <span class="menu-item-text">Cosergirl图库</span>
              <el-badge :value="cosergirlCount" :max="999" class="menu-badge" />
            </template>
          </el-menu-item>

          <el-menu-item-group title="评分筛选">
            <el-menu-item
              v-for="star in starLevels"
              :key="star.value"
              :index="`/gallery/star/${star.value}`"
            >
              <span class="menu-item-text">{{ star.label }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 数据统计 -->
        <el-menu-item index="/stats">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>

        <!-- 调试工具 -->
        <el-menu-item index="/debug">
          <el-icon><Setting /></el-icon>
          <template #title>调试工具</template>
        </el-menu-item>

        <!-- 系统设置 -->
        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>系统设置</span>
          </template>

          <el-menu-item index="/settings/general">
            <template #title>常规设置</template>
          </el-menu-item>

          <el-menu-item index="/settings/tags">
            <template #title>标签管理</template>
          </el-menu-item>

          <el-menu-item index="/settings/import">
            <template #title>数据导入</template>
          </el-menu-item>

          <el-menu-item index="/settings/export">
            <template #title>数据导出</template>
          </el-menu-item>

          <el-menu-item index="/settings/backup">
            <template #title>备份恢复</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 用户区域 -->
    <div class="user-area" v-if="!isCollapsed">
      <el-divider />

      <div class="user-info" @click="showUserMenu">
        <el-avatar :size="40" :src="userAvatar" />
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
        <el-icon><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions" v-if="!isCollapsed">
      <el-divider>快捷操作</el-divider>

      <div class="action-buttons">
        <el-button
          type="primary"
          size="small"
          @click="goTo('/characters/create')"
          class="action-button"
        >
          <el-icon><Plus /></el-icon>
          新建角色
        </el-button>

        <el-button
          type="success"
          size="small"
          @click="refreshAllData"
          :loading="refreshing"
          class="action-button"
        >
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  UserFilled,
  PictureFilled,
  DataAnalysis,
  Setting,
  Tools,
  Plus,
  Refresh,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 状态
const isCollapsed = ref(false)
const userAvatar = ref('')
const userName = ref('管理员')
const userRole = ref('系统管理员')
const refreshing = ref(false)

// 统计数据
const characterCount = ref(0)
const xwangCount = ref(0)
const cosergirlCount = ref(0)
const ageRatingStats = ref({})

// 配置
const ageRatingOptions = [
  { value: 1, label: 'G - 全年龄' },
  { value: 2, label: 'PG - 家长指导' },
  { value: 3, label: 'PG-13 - 13岁以上' },
  { value: 4, label: 'R - 限制级' },
  { value: 5, label: 'NC-17 - 成人内容' },
]

const starLevels = [
  { value: 0, label: '未收藏' },
  { value: 1, label: '一般' },
  { value: 2, label: '还行' },
  { value: 3, label: '不错' },
  { value: 4, label: '很好' },
  { value: 5, label: '最爱' },
]

// 计算属性
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/characters')) return '/characters'
  if (path.startsWith('/xwang')) return '/xwang'
  if (path.startsWith('/cosergirl')) return '/cosergirl'
  if (path.startsWith('/stats')) return '/stats'
  if (path.startsWith('/debug')) return '/debug'
  if (path.startsWith('/settings')) return 'settings'
  return '/'
})

// 生命周期
onMounted(() => {
  loadStats()
  loadUserInfo()

  // 从本地存储读取侧边栏状态
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = JSON.parse(savedState)
  }
})

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed.value))
}

const goHome = () => {
  router.push('/')
}

const goTo = (path) => {
  router.push(path)
}

const handleMenuSelect = (index) => {
  // 处理菜单选择
  console.log('Menu selected:', index)
}

const showUserMenu = () => {
  // 显示用户菜单
  console.log('Show user menu')
}

const refreshAllData = async () => {
  refreshing.value = true
  try {
    // 这里可以调用各个store的刷新方法
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟延迟
    await loadStats()
  } finally {
    refreshing.value = false
  }
}

const loadStats = async () => {
  try {
    // 这里应该调用API获取统计数据
    characterCount.value = 150
    xwangCount.value = 1000
    cosergirlCount.value = 500

    // 模拟分级统计
    ageRatingStats.value = {
      1: 25,
      2: 40,
      3: 50,
      4: 25,
      5: 10,
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadUserInfo = () => {
  // 从localStorage或API加载用户信息
  const savedUser = localStorage.getItem('userInfo')
  if (savedUser) {
    const user = JSON.parse(savedUser)
    userName.value = user.name || '管理员'
    userRole.value = user.role || '系统管理员'
    userAvatar.value = user.avatar || ''
  }
}

const getRatingCount = (rating) => {
  return ageRatingStats.value[rating] || 0
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: linear-gradient(180deg, #1a2b3c 0%, #0d1b2a 100%);
  color: white;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 64px;
}

.collapse-button {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 1001;
}

.collapse-button:hover {
  background-color: #409eff;
  color: white;
  transform: scale(1.1);
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-area:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-name {
  font-size: 18px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}

.app-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.menu-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0;
}

.menu-area .el-menu {
  background-color: transparent;
  border-right: none;
}

.menu-area :deep(.el-menu-item),
.menu-area :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

.menu-area :deep(.el-menu-item:hover),
.menu-area :deep(.el-sub-menu__title:hover) {
  background-color: rgba(64, 158, 255, 0.1);
  color: white;
}

.menu-area :deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2);
  color: white;
  border-left: 3px solid #409eff;
}

.menu-area :deep(.el-menu-item) .el-icon,
.menu-area :deep(.el-sub-menu__title) .el-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

.menu-area :deep(.el-menu-item.is-active) .el-icon {
  color: white;
}

.menu-item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-badge {
  margin-left: 8px;
}

.user-area {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: white;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.quick-actions {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-divider) {
  margin: 20px 0;
  border-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-divider__text) {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  padding: 0 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-button {
  width: 100%;
  justify-content: flex-start;
  padding-left: 12px;
}

/* 滚动条样式 */
.menu-area::-webkit-scrollbar {
  width: 4px;
}

.menu-area::-webkit-scrollbar-track {
  background: transparent;
}

.menu-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.menu-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
