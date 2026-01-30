import { http } from './client'

export const xwangApi = {
  // 获取列表
  getXwang(params) {
    return http.get('/xwang', params)
  },

  // 获取详情
  getXwangById(id) {
    return http.get(`/xwang/${id}`)
  },

  // 按star筛选
  getByStar(star, params) {
    return http.get('/xwang/filter/star', {
      star,
      ...params,
    })
  },

  // 获取star统计
  getStarStats() {
    return http.get('/xwang/stats/star')
  },

  // 搜索
  search(name, params) {
    return http.get('/xwang/search', {
      name,
      ...params,
    })
  },

  // 更新star
  updateStar(id, star) {
    return http.patch(`/xwang/${id}/star`, { star })
  },

  // 批量更新star
  batchUpdateStar(ids, star) {
    return http.patch('/xwang/batch/star', { ids, star })
  },

  // 构建图片URL的工具函数 - 根据接口 /api/files/xwang/{xid}/{filename}
   buildImageUrl(item, filename) {
    if (!item || !item.xid) return null

    // 确保 filename 是字符串，而不是数组
    let cleanFilename = filename
    if (Array.isArray(filename)) {
      cleanFilename = filename[0] || ''
    }

    if (!cleanFilename) return null

    // 编码文件名，确保 URL 正确
    const encodedFilename = encodeURIComponent(cleanFilename)
    return `/api/files/xwang/${item.xid}/${encodedFilename}`
  },

  // 获取封面图片
  getCoverImage(item) {
    if (!item || !item.images || item.images.length === 0) return null
    return this.buildImageUrl(item, item.images[0][0])
  },

  // 获取所有图片URL
  getAllImageUrls(item) {
    if (!item || !item.images) return []

    return item.images.map((img) => ({
      filename: img[0],
      size: img[1],
      url: this.buildImageUrl(item, img[0]),
    }))
  },

  // 获取预览列表
  getPreviewList(item) {
    if (!item || !item.images) return []
    return item.images.map((img) => this.buildImageUrl(item, img[0]))
  },

  // 批量操作：删除
  batchDelete(ids) {
    return http.post('/xwang/batch/delete', { ids })
  },

  // 批量操作：更新属性
  batchUpdate(ids, data) {
    return http.patch('/xwang/batch/update', { ids, ...data })
  },

  // 获取统计信息
  getStats() {
    return http.get('/xwang/stats')
  },

  // 导出数据
  exportData(params) {
    return http.get('/xwang/export', params, { responseType: 'blob' })
  },

  // 导入数据
  importData(formData) {
    return http.post('/xwang/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 新增：按角色搜索
  searchByCharacter(character, params = {}) {
    return http.get('/xwang/filter/character', {
      character,
      ...params,
    })
  },

  // 新增：获取角色统计
  getCharacterStats() {
    return http.get('/xwang/stats/character')
  },

  // 新增：获取所有角色（去重）
  getCharacters(params = {}) {
    return http.get('/xwang/characters', params)
  },
}
