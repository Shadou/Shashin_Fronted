<template>
  <div class="app-container">
    <Header />

    <div class="main-layout">
      <div class="main-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component, route }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </div>

        <Footer />
      </div>
    </div>

    <!-- 全局通知 -->
    <div class="global-notifications">
      <div v-if="offline" class="offline-notification">
        <el-alert
          title="网络连接已断开"
          type="warning"
          description="当前处于离线状态，部分功能可能受限"
          show-icon
          closable
          @close="offline = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'

const router = useRouter()

// 全局状态
const offline = ref(false)

// 提供全局方法
const globalMethods = {
  showNotification: (type, message, title = '提示') => {
    // 这里可以调用Element Plus的通知组件
    console.log(`[${type}] ${title}: ${message}`)
  },
  refreshComponent: () => {
    // 刷新当前组件的方法
    const currentPath = router.currentRoute.value.fullPath
    router.replace({ path: currentPath, query: { t: Date.now() } })
  },
}

provide('global', globalMethods)

// 网络状态检测
const updateOnlineStatus = () => {
  offline.value = !navigator.onLine
}

// 生命周期
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style>
/* 全局主题变量 */
:root {
  /* 浅色主题变量 */
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;

  /* 浅色主题背景色 */
  --bg-color: #ffffff;
  --bg-color-secondary: #f5f7fa;
  --bg-color-tertiary: #e4e7ed;

  /* 浅色主题文字颜色 */
  --text-primary-color: #303133;
  --text-secondary-color: #606266;
  --text-tertiary-color: #909399;
  --text-disabled-color: #c0c4cc;

  /* 浅色主题边框颜色 */
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-lighter: #ebeef5;
  --border-color-extra-light: #f2f6fc;

  /* 浅色主题组件颜色 */
  --header-bg-color: #ffffff;
  --header-shadow-color: rgba(0, 0, 0, 0.1);
  --tab-bg-color: #f5f5f5;
  --hover-bg-color: #f5f7fa;
  --unread-bg-color: #f0f9ff;
  --notification-icon-bg: #e6f7ff;
}

/* 深色主题变量 */
html.dark-theme,
[data-theme='dark'] {
  /* Element Plus 深色主题支持 */
  color-scheme: dark;

  /* 深色主题背景色 */
  --bg-color: #141414;
  --bg-color-secondary: #1f1f1f;
  --bg-color-tertiary: #2d2d2d;

  /* 深色主题文字颜色 */
  --text-primary-color: #ffffff;
  --text-secondary-color: rgba(255, 255, 255, 0.65);
  --text-tertiary-color: rgba(255, 255, 255, 0.45);
  --text-disabled-color: rgba(255, 255, 255, 0.25);

  /* 深色主题边框颜色 */
  --border-color: #434343;
  --border-color-light: #2a2a2a;
  --border-color-lighter: #1f1f1f;
  --border-color-extra-light: #1d1d1d;

  /* 深色主题组件颜色 */
  --header-bg-color: #1f1f1f;
  --header-shadow-color: rgba(0, 0, 0, 0.3);
  --tab-bg-color: #141414;
  --hover-bg-color: #2a2a2a;
  --unread-bg-color: #111b26;
  --notification-icon-bg: #111b26;
}

/* 应用全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-color-secondary);
  color: var(--text-primary-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

#app {
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-secondary);
  transition: background-color 0.3s ease;
}

.main-layout {
  flex: 1;
  margin-top: 110px; /* header高度 + tab栏高度 */
  transition: margin-top 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 110px);
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  background-color: var(--bg-color-secondary);
  overflow-y: auto;
  transition: background-color 0.3s ease;
}

/* 覆盖 Element Plus 组件在深色主题下的样式 */
html.dark-theme .el-button,
[data-theme='dark'] .el-button {
  --el-button-bg-color: #2a2a2a;
  --el-button-border-color: #434343;
  --el-button-text-color: #ffffff;
}

html.dark-theme .el-input,
[data-theme='dark'] .el-input {
  --el-input-bg-color: #1f1f1f;
  --el-input-border-color: #434343;
  --el-input-text-color: #ffffff;
  --el-input-placeholder-color: rgba(255, 255, 255, 0.45);
}

html.dark-theme .el-tabs,
[data-theme='dark'] .el-tabs {
  --el-bg-color: #1f1f1f;
}

html.dark-theme .el-dropdown-menu,
[data-theme='dark'] .el-dropdown-menu {
  --el-bg-color-overlay: #1f1f1f;
  --el-text-color-regular: #ffffff;
  --el-border-color-light: #434343;
}

.global-notifications {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.offline-notification {
  margin-bottom: 10px;
}

/* 路由过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-layout {
    margin-top: 60px; /* 移动端只显示header */
  }

  .content-wrapper {
    padding: 10px;
  }

  .global-notifications {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
