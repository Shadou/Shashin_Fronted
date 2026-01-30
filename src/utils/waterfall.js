// utils/waterfall.js
export class WaterfallLayout {
  constructor(options = {}) {
    this.columnCount = options.columnCount || 4
    this.gap = options.gap || 15
    this.itemWidth = options.itemWidth || 250
    this.items = []
    this.columnHeights = []
    this.containerWidth = 0

    this.reset()
  }

  reset() {
    this.columnHeights = new Array(this.columnCount).fill(0)
  }

  addItem(height, data = {}) {
    // 找到最短的列
    const shortestColumnIndex = this.columnHeights.indexOf(Math.min(...this.columnHeights))

    // 计算位置
    const left = shortestColumnIndex * (this.itemWidth + this.gap)
    const top = this.columnHeights[shortestColumnIndex]

    // 更新列高度
    this.columnHeights[shortestColumnIndex] += height + this.gap

    const item = {
      ...data,
      index: this.items.length,
      height,
      column: shortestColumnIndex,
      left,
      top,
    }

    this.items.push(item)
    return item
  }

  getTotalHeight() {
    return Math.max(...this.columnHeights) - this.gap
  }

  updateColumnCount(newColumnCount) {
    this.columnCount = newColumnCount
    this.reset()
    this.recalculateLayout()
  }

  recalculateLayout() {
    this.reset()

    this.items.forEach((item, index) => {
      const shortestColumnIndex = this.columnHeights.indexOf(Math.min(...this.columnHeights))

      item.column = shortestColumnIndex
      item.left = shortestColumnIndex * (this.itemWidth + this.gap)
      item.top = this.columnHeights[shortestColumnIndex]

      this.columnHeights[shortestColumnIndex] += item.height + this.gap
    })
  }

  getItems() {
    return this.items
  }

  clear() {
    this.items = []
    this.reset()
  }
}

// 图片预加载管理器
export class ImagePreloader {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent
    this.queue = []
    this.loading = 0
    this.cache = new Map()
  }

  preload(url) {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url))
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject })
      this.processQueue()
    })
  }

  processQueue() {
    while (this.loading < this.maxConcurrent && this.queue.length > 0) {
      const { url, resolve, reject } = this.queue.shift()
      this.loading++

      const img = new Image()
      img.src = url

      img.onload = () => {
        this.loading--
        this.cache.set(url, {
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
        })
        resolve(this.cache.get(url))
        this.processQueue()
      }

      img.onerror = () => {
        this.loading--
        reject(new Error(`Failed to load image: ${url}`))
        this.processQueue()
      }
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

// 响应式列数计算
export function calculateColumnCount(containerWidth, minWidth = 200, gap = 15) {
  return Math.max(1, Math.floor((containerWidth + gap) / (minWidth + gap)))
}

// 防抖函数
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
