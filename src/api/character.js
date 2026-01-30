import { http } from './client'

// 角色管理API
export const characterApi = {
  // 获取角色列表
  getCharacters(params) {
    return http.get('/characters', params)
  },

  // 获取单个角色
  getCharacterById(id) {
    return http.get(`/characters/${id}`)
  },

  // 按age_rating筛选
  getByAgeRating(rating, params) {
    return http.get('/characters/filter/age-rating', {
      age_rating: rating,
      ...params,
    })
  },

  // 按star筛选
  getByStar(star, params) {
    return http.get('/characters/filter/star', {
      star,
      ...params,
    })
  },

  // 获取star统计
  getStarStats() {
    return http.get('/characters/stats/star')
  },

  // 获取age_rating统计
  getAgeRatingStats() {
    return http.get('/characters/stats/age-rating')
  },

  // 更新star
  updateStar(id, star) {
    return http.patch(`/characters/${id}/star`, { star })
  },

  // 更新age_rating
  updateAgeRating(id, ageRating) {
    return http.patch(`/characters/${id}/age-rating`, { age_rating: ageRating })
  },

  // 批量更新star
  batchUpdateStar(ids, star) {
    return http.patch('/characters/batch/star', { ids, star })
  },

  // 批量更新age_rating
  batchUpdateAgeRating(ids, ageRating) {
    return http.patch('/characters/batch/age-rating', { ids, age_rating: ageRating })
  },

  // 创建角色
  createCharacter(characterData) {
    return http.post('/characters', characterData)
  },

  // 更新角色
  updateCharacter(id, characterData) {
    return http.put(`/characters/${id}`, characterData)
  },

  // 删除角色
  deleteCharacter(id) {
    return http.delete(`/characters/${id}`)
  },
}
