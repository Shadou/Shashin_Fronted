// api/cosergirl.js
import { http } from './client'

export const cosergirlApi = {
  // 获取列表
  getCosergirl(params) {
    return http.get('/cosergirl', params)
  },

  // 获取详情
  getCosergirlById(id) {
    return http.get(`/cosergirl/${id}`)
  },

  // 按star筛选
  getByStar(star, params) {
    return http.get('/cosergirl/filter/star', {
      star,
      ...params,
    })
  },

  // 获取star统计
  getStarStats() {
    return http.get('/cosergirl/stats/star')
  },

  // 更新star
  updateStar(id, star) {
    return http.patch(`/cosergirl/${id}/star`, { star })
  },

  // 批量更新star
  batchUpdateStar(ids, star) {
    return http.patch('/cosergirl/batch/star', { ids, star })
  },

  // 构建图片URL - 为了保持向后兼容，保留 buildImageUrl 和 getImageUrl
  buildImageUrl(item, imageFilename) {
    return this.getImageUrl(item, imageFilename)
  },

  // 获取图片URL
  getImageUrl(item, imageFilename) {
    if (!item || !imageFilename) return null

    // 直接使用代理接口构建URL
    if (item.fullPathInfo) {
      const { rootId, origin } = item.fullPathInfo
      const fullPath = encodeURIComponent(`${item.path}/${imageFilename}`)
      return `/api/proxy/file?origin=${origin}&root=${rootId}&path=${fullPath}`
    }

    // 备选方案
    if (item.root !== undefined && item.path) {
      const fullPath = encodeURIComponent(`${item.path}/${imageFilename}`)
      return `/api/proxy/file?origin=cosergirl&root=${item.root}&path=${fullPath}`
    }

    return null
  },

  // 获取封面图片 - 优先使用coverImageProxy
  getCoverImage(item) {
    // 1. 优先使用后端返回的coverImageProxy
    if (item && item.coverImageProxy) {
      return item.coverImageProxy;
    }

    // 2. 其次使用coverImage
    if (item && item.coverImage) {
      return item.coverImage;
    }

    // 3. 从images数组构建
    if (item && item.images && item.images.length > 0) {
      // 注意：现在images是对象数组，每个对象有path属性
      const firstImage = item.images[0];
      if (firstImage && firstImage.path) {
        return this.getImageUrl(item, firstImage.path);
      }
    }

    // 4. 如果没有图片，返回默认图片
    return '/default-cover.jpg';
  },

  // 获取所有图片URL
  getAllImageUrls(item) {
    if (!item || !item.images) return [];

    // 如果有imagesWithUrls，直接使用
    if (item.imagesWithUrls && Array.isArray(item.imagesWithUrls)) {
      return item.imagesWithUrls.map(img => ({
        ...img,
        proxyUrl: img.proxyUrl || img.url
      }));
    }

    // 否则从images构建
    return item.images.map(img => ({
      ...img,
      url: this.getImageUrl(item, img.path),
      proxyUrl: this.getImageUrl(item, img.path)
    }));
  },

  // 获取图片预览列表
  getPreviewList(item) {
    if (!item || !item.images) return [];

    // 如果有imagesWithUrls，直接使用
    if (item.imagesWithUrls && Array.isArray(item.imagesWithUrls)) {
      return item.imagesWithUrls.map(img => img.proxyUrl || img.url);
    }

    // 否则从images构建
    return item.images
      .map(img => {
        if (img && img.path) {
          return this.getImageUrl(item, img.path);
        }
        return null;
      })
      .filter(url => url);
  },

  // 构建视频URL
  buildVideoUrl(item, videoFilename) {
    return this.getVideoUrl(item, videoFilename)
  },

  // 获取视频URL
  getVideoUrl(item, videoFilename) {
    if (!item || !videoFilename) return null

    if (item.fullPathInfo) {
      const { rootId, origin } = item.fullPathInfo
      const fullPath = encodeURIComponent(`${item.path}/${videoFilename}`)
      return `/api/proxy/file?origin=${origin}&root=${rootId}&path=${fullPath}`
    }

    if (item.root !== undefined && item.path) {
      const fullPath = encodeURIComponent(`${item.path}/${videoFilename}`)
      return `/api/proxy/file?origin=cosergirl&root=${item.root}&path=${fullPath}`
    }

    return null
  },

  // 获取所有视频URL
  getAllVideoUrls(item) {
    if (!item || !item.videos) return []

    return item.videos.map(video => ({
      ...video,
      url: this.getVideoUrl(item, video.path),
      proxyUrl: this.getVideoUrl(item, video.path)
    }))
  }
}
