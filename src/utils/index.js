// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0 || bytes === undefined || bytes === null) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export const formatDate = (dateString, format = 'YYYY-MM-DD HH:mm') => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const pad = (num) => num.toString().padStart(2, '0')

  const replacements = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => replacements[match])
}

// 防抖函数
export const debounce = (func, wait = 300) => {
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

// 节流函数
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      cloned[key] = deepClone(obj[key])
    }
    return cloned
  }
}

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 会话存储工具函数
export const saveToSessionStorage = (key, value) => {
  try {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    sessionStorage.setItem(key, value)
  } catch (error) {
    console.error('保存到sessionStorage失败:', error)
  }
}

export const getFromSessionStorage = (key) => {
  try {
    const value = sessionStorage.getItem(key)
    if (!value) return null

    // 尝试解析JSON
    try {
      return JSON.parse(value)
    } catch (e) {
      // 如果不是JSON，直接返回
      return value
    }
  } catch (error) {
    console.error('从sessionStorage读取失败:', error)
    return null
  }
}

export const removeFromSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('从sessionStorage移除失败:', error)
  }
}

export const clearSessionStorage = () => {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('清空sessionStorage失败:', error)
  }
}

// 在utils.js中添加以下函数
export const isVideoFile = (filename) => {
  if (!filename) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.flv', '.wmv', '.mkv']
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

export const isImageFile = (filename) => {
  if (!filename) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

export const getFileType = (filename) => {
  if (isVideoFile(filename)) return 'video'
  if (isImageFile(filename)) return 'image'
  return 'other'
}

export const formatDuration = (seconds) => {
  if (isNaN(seconds)) return '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}
