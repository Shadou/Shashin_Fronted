<template>
  <div class="app-header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="logo-area" @click="goHome">
        <el-icon size="28" color="#409EFF"><Picture /></el-icon>
        <span class="app-name">Coser Gallery</span>
      </div>

      <!-- 搜索框 -->
      <div class="search-area">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索角色、图片集..."
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearchClear"
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-dropdown @command="handleSearchType" class="search-type-dropdown">
          <el-button type="primary" size="large">
            {{ searchTypeLabel }}
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部</el-dropdown-item>
              <el-dropdown-item command="character">角色</el-dropdown-item>
              <el-dropdown-item command="xwang">Xwang</el-dropdown-item>
              <el-dropdown-item command="cosergirl">Cosergirl</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 功能按钮 -->
      <div class="action-area">
        <el-button-group>
          <el-tooltip content="切换主题" placement="bottom">
            <el-button @click="toggleTheme" :icon="themeIcon" circle />
          </el-tooltip>
          <el-tooltip content="刷新数据" placement="bottom">
            <el-button @click="refreshData" :icon="Refresh" circle />
          </el-tooltip>
          <el-tooltip content="数据统计" placement="bottom">
            <el-button @click="goToStats" :icon="DataAnalysis" circle />
          </el-tooltip>
          <el-tooltip content="调试工具" placement="bottom">
            <el-button @click="goToDebug" :icon="Setting" circle />
          </el-tooltip>
        </el-button-group>

        <!-- 通知按钮 -->
        <el-dropdown @command="handleNotificationCommand" trigger="click">
          <el-badge :value="unreadCount" :max="99" class="notification-badge">
            <el-button :icon="Bell" circle />
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="notification-header">
                <span>通知中心</span>
                <el-button type="text" size="small" @click="markAllAsRead"> 全部已读 </el-button>
              </div>
              <div class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-icon">
                    <el-icon>
                      <component :is="notification.icon" />
                    </el-icon>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                </div>
              </div>
              <div class="notification-footer">
                <el-button type="text" @click="viewAllNotifications">查看全部</el-button>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 标签栏 -->
    <div class="tab-bar">
      <div class="tab-scroll">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="首页" name="/" />
          <el-tab-pane label="角色管理" name="/characters" />
          <el-tab-pane label="Xwang图库" name="/xwang" />
          <el-tab-pane label="Cosergirl图库" name="/cosergirl" />
          <el-tab-pane label="数据统计" name="/stats" />
          <el-tab-pane label="调试工具" name="/debug" />
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Picture,
  Search,
  ArrowDown,
  Refresh,
  DataAnalysis,
  Setting,
  Bell,
  Sunny,
  Moon,
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

// 状态
const searchKeyword = ref('')
const searchType = ref('all')
const activeTab = ref('/')
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

// 监听路由变化，更新 activeTab
watch(
  () => route.path,
  (newPath) => {
    // 将路径映射到对应的标签
    const tabMapping = {
      '/': '/',
      '/characters': '/characters',
      '/characters/create': '/characters',
      '/characters/edit/': '/characters',
      '/xwang': '/xwang',
      '/cosergirl': '/cosergirl',
      '/stats': '/stats',
      '/debug': '/debug',
    }

    // 查找匹配的标签
    for (const [path, tabName] of Object.entries(tabMapping)) {
      if (newPath.startsWith(path)) {
        activeTab.value = tabName
        break
      }
    }
  },
  { immediate: true },
)

// 计算属性
const searchTypeLabel = computed(() => {
  const labels = {
    all: '全部',
    character: '角色',
    xwang: 'Xwang',
    cosergirl: 'Cosergirl',
  }
  return labels[searchType.value] || '全部'
})

const themeIcon = computed(() => (themeStore.theme === 'dark' ? Moon : Sunny))

// 生命周期
onMounted(() => {
  activeTab.value = route.path
  loadNotifications()
})

// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const handleSystemThemeChange = (e) => {
  if (!themeStore.hasUserPreference) {
    themeStore.setTheme(e.matches ? 'dark' : 'light')
  }
}

onMounted(() => {
  mediaQuery.addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleSystemThemeChange)
})

// 方法
const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) return

  // 根据搜索类型跳转到不同页面
  switch (searchType.value) {
    case 'character':
      router.push({
        path: '/characters',
        query: { search: searchKeyword.value },
      })
      break
    case 'xwang':
      router.push({
        path: '/xwang',
        query: { search: searchKeyword.value },
      })
      break
    case 'cosergirl':
      router.push({
        path: '/cosergirl',
        query: { search: searchKeyword.value },
      })
      break
    default:
      // 综合搜索页面
      router.push({
        path: '/search',
        query: { q: searchKeyword.value },
      })
  }
}

const handleSearchClear = () => {
  // 清空搜索时的处理
}

const handleSearchType = (type) => {
  searchType.value = type
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const refreshData = () => {
  // 这里可以触发全局数据刷新
  window.location.reload()
}

const goToStats = () => {
  router.push('/stats')
}

const goToDebug = () => {
  router.push('/debug')
}

const loadNotifications = () => {
  // 模拟通知数据
  notifications.value = [
    {
      id: 1,
      title: '系统更新',
      message: '系统已更新到最新版本',
      icon: 'InfoFilled',
      time: '10分钟前',
      read: false,
      type: 'system',
    },
    {
      id: 2,
      title: '新角色添加',
      message: '成功添加新角色',
      icon: 'UserFilled',
      time: '1小时前',
      read: true,
      type: 'character',
    },
    {
      id: 3,
      title: '图片同步完成',
      message: '图片同步任务已完成',
      icon: 'PictureFilled',
      time: '2小时前',
      read: false,
      type: 'sync',
    },
  ]
}

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
}

const viewAllNotifications = () => {
  // 跳转到通知页面
  console.log('查看全部通知')
}

const handleNotificationCommand = (command) => {
  console.log('Notification command:', command)
}

const handleNotificationClick = (notification) => {
  notification.read = true

  // 根据通知类型处理点击事件
  switch (notification.type) {
    case 'character':
      router.push('/characters')
      break
    case 'sync':
      // 处理同步相关
      break
    // ... 其他类型
  }
}

const handleTabClick = (tab) => {
  // 如果当前已经在目标路由，强制刷新
  if (route.path === tab.paneName) {
    // 使用 replace 而不是 push 来强制刷新
    router.replace({
      path: tab.paneName,
      query: { ...route.query, t: Date.now() }, // 添加时间戳参数
    })
  } else {
    router.push(tab.paneName)
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--header-bg-color);
  box-shadow: 0 2px 12px var(--header-shadow-color);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.header-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.logo-area:hover {
  opacity: 0.8;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary-color);
}

.search-area {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-type-dropdown {
  flex-shrink: 0;
}

.action-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-badge :deep(.el-badge__content) {
  top: 8px;
  right: 8px;
}

.tab-bar {
  height: 50px;
  background-color: var(--tab-bg-color);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.tab-scroll {
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-scroll :deep(.el-tabs) {
  height: 100%;
}

.tab-scroll :deep(.el-tabs__header) {
  margin: 0;
  border: none;
}

.tab-scroll :deep(.el-tabs__nav-wrap) {
  height: 100%;
}

.tab-scroll :deep(.el-tabs__nav-scroll) {
  height: 100%;
  display: flex;
  align-items: center;
}

.tab-scroll :deep(.el-tabs__nav) {
  display: flex;
  height: 100%;
}

.tab-scroll :deep(.el-tabs__item) {
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--text-primary-color);
  transition: color 0.3s ease;
}

.tab-scroll :deep(.el-tabs__item:hover) {
  color: var(--primary-color);
}

.tab-scroll :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

.tab-scroll :deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

/* 通知下拉菜单样式 */
.notification-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: var(--text-primary-color);
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid var(--border-color-light);
}

.notification-item:hover {
  background-color: var(--hover-bg-color);
}

.notification-item.unread {
  background-color: var(--unread-bg-color);
}

.notification-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--notification-icon-bg);
  border-radius: 50%;
  color: var(--primary-color);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  color: var(--text-primary-color);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: var(--text-secondary-color);
}

.notification-footer {
  padding: 8px 16px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }

  .app-name {
    display: none;
  }

  .search-area {
    margin: 0 10px;
    max-width: none;
  }

  .action-area {
    gap: 5px;
  }

  .tab-scroll :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 14px;
  }
}
</style>
