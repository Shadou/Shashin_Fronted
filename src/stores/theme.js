import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const theme = ref('light')
  const hasUserPreference = ref(false)

  // 初始化主题
  const initTheme = () => {
    // 1. 先检查 localStorage 中的用户偏好
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme
      hasUserPreference.value = true
    } else {
      // 2. 如果没有用户偏好，检查系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
      hasUserPreference.value = false
    }

    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement

    // 移除现有的主题类
    html.classList.remove('light-theme', 'dark-theme')

    // 添加新的主题类
    html.classList.add(`${theme.value}-theme`)

    // 设置 data-theme 属性
    html.setAttribute('data-theme', theme.value)

    // 更新 Element Plus 主题
    updateElementPlusTheme()
  }

  // 更新 Element Plus 主题
  const updateElementPlusTheme = () => {
    const el = document.querySelector('body')
    if (!el) return

    if (theme.value === 'dark') {
      el.classList.add('dark')
    } else {
      el.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    hasUserPreference.value = true
    saveTheme()
    applyTheme()
  }

  // 设置主题
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme
      hasUserPreference.value = true
      saveTheme()
      applyTheme()
    }
  }

  // 保存主题到 localStorage
  const saveTheme = () => {
    localStorage.setItem('theme', theme.value)
  }

  // 重置为主题（清除用户偏好）
  const resetTheme = () => {
    localStorage.removeItem('theme')
    hasUserPreference.value = false
    initTheme()
  }

  // 初始化
  initTheme()

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!hasUserPreference.value) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  }

  return {
    theme,
    hasUserPreference,
    toggleTheme,
    setTheme,
    resetTheme,
    applyTheme,
  }
})
