import { ref, onUnmounted } from 'vue'

export function useImageLoader(options = {}) {
  const { maxConcurrent = 3, preloadCount = 5, lazy = true } = options

  const loading = ref(false)
  const loadedCount = ref(0)
  const failedCount = ref(0)
  const progress = ref(0)
  const activeLoads = ref(0)

  const loadQueue = []
  const activePromises = new Set()

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        resolve({ url, success: true, img })
      }

      img.onerror = () => {
        reject({ url, success: false, error: new Error('图片加载失败') })
      }

      img.src = url
    })
  }

  const addToQueue = (urls) => {
    if (Array.isArray(urls)) {
      loadQueue.push(...urls.map((url) => ({ url, priority: 0 })))
    } else {
      loadQueue.push({ url: urls, priority: 0 })
    }

    if (!loading.value) {
      startLoading()
    }
  }

  const startLoading = async () => {
    loading.value = true
    const total = loadQueue.length

    while (loadQueue.length > 0) {
      // 控制并发数量
      while (activeLoads.value >= maxConcurrent && loadQueue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // 获取下一个要加载的图片
      const item = loadQueue.shift()
      if (!item) break

      // 开始加载
      activeLoads.value++
      const promise = loadImage(item.url)
      activePromises.add(promise)

      promise
        .then(() => {
          loadedCount.value++
          progress.value = Math.round((loadedCount.value / total) * 100)
        })
        .catch(() => {
          failedCount.value++
        })
        .finally(() => {
          activeLoads.value--
          activePromises.delete(promise)
        })
    }

    // 等待所有图片加载完成
    await Promise.allSettled(Array.from(activePromises))
    loading.value = false
  }

  const preloadImages = (urls) => {
    const preloadUrls = urls.slice(0, preloadCount)
    addToQueue(preloadUrls)
  }

  const cancel = () => {
    loadQueue.length = 0
    activePromises.forEach((promise) => {
      // 取消图片加载
      // 注意：实际上无法取消正在加载的图片，但我们可以忽略结果
    })
    activePromises.clear()
    loading.value = false
  }

  const reset = () => {
    cancel()
    loadedCount.value = 0
    failedCount.value = 0
    progress.value = 0
    activeLoads.value = 0
  }

  onUnmounted(() => {
    cancel()
  })

  return {
    loading,
    loadedCount,
    failedCount,
    progress,
    activeLoads,
    addToQueue,
    preloadImages,
    cancel,
    reset,
    loadImage,
  }
}
