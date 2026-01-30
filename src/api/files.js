import { http } from './client'

export const filesApi = {
  // 构建Cosergirl图片URL
  buildCosergirlImageUrl(item, imageFilename) {
    if (!item || !item._id || !imageFilename) return null
    const encodedFilename = encodeURIComponent(imageFilename)
    return `/api/images/cosergirl/${item._id}?filename=${encodedFilename}`
  },

  // 构建Xwang图片URL
  buildXwangImageUrl(item, imageFilename) {
    if (!item || !item.xid || !imageFilename) return null
    const encodedFilename = encodeURIComponent(imageFilename)
    return `/api/files/xwang/${item.xid}/${encodedFilename}`
  },

  // 通用构建图片URL（自动判断类型）
  buildImageUrl(item, imageFilename) {
    if (!item || !imageFilename) return null

    if (item.xid) {
      return this.buildXwangImageUrl(item, imageFilename)
    } else if (item._id) {
      return this.buildCosergirlImageUrl(item, imageFilename)
    }
    return null
  },

  // 获取封面图片
  getCoverImage(item) {
    if (!item || !item.images || item.images.length === 0) return null

    if (item.xid) {
      return this.buildXwangImageUrl(item, item.images[0][0])
    } else if (item._id) {
      return this.buildCosergirlImageUrl(item, item.images[0][0])
    }
    return null
  },

  // 获取所有图片URL
  getAllImageUrls(item) {
    if (!item || !item.images) return []

    return item.images.map((img) => ({
      filename: img[0],
      size: img[1],
      url: item.xid
        ? this.buildXwangImageUrl(item, img[0])
        : this.buildCosergirlImageUrl(item, img[0]),
    }))
  },

  // 获取预览列表
  getPreviewList(item) {
    if (!item || !item.images) return []

    return item.images.map((img) => {
      if (item.xid) {
        return this.buildXwangImageUrl(item, img[0])
      } else if (item._id) {
        return this.buildCosergirlImageUrl(item, img[0])
      }
      return ''
    })
  },

  // 批量下载图片
  async downloadImages(item, filenames = null) {
    if (!item) return null

    const images = filenames
      ? (item.images || []).filter((img) => filenames.includes(img[0]))
      : item.images || []

    const downloadPromises = images.map(async (img) => {
      const url = item.xid
        ? this.buildXwangImageUrl(item, img[0])
        : this.buildCosergirlImageUrl(item, img[0])

      try {
        const response = await fetch(url)
        const blob = await response.blob()
        return {
          filename: img[0],
          blob,
          url: URL.createObjectURL(blob),
        }
      } catch (error) {
        console.error(`下载图片失败: ${img[0]}`, error)
        return null
      }
    })

    return await Promise.all(downloadPromises)
  },

  // 下载单个图片
  async downloadImage(item, filename) {
    if (!item || !filename) return null

    const url = this.buildImageUrl(item, filename)
    if (!url) return null

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理URL对象
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl)
      }, 1000)

      return { success: true, filename }
    } catch (error) {
      console.error(`下载图片失败: ${filename}`, error)
      return { success: false, filename, error }
    }
  },

  // 打开图片所在文件夹（模拟）
  openImageFolder(item) {
    if (!item) return false

    // 这里可以调用原生API或发送请求到后端
    console.log('打开文件夹:', item.path || item.xid || item._id)
    return true
  },

  // 复制图片URL到剪贴板
  async copyImageUrl(item, filename) {
    if (!item || !filename) return false

    const url = this.buildImageUrl(item, filename)
    if (!url) return false

    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.error('复制URL失败:', error)
      return false
    }
  },
}
