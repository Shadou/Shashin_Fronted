import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { characterApi } from '@/api/character'
import { starConfig, ageRatingConfig } from '@/utils/config'

export const useCharacterStore = defineStore('character', () => {
  // 状态
  const characters = ref([])
  const currentCharacter = ref(null)
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // 筛选条件
  const filters = ref({
    search: '',
    sortBy: 'name',
    order: 'asc',
  })

  // 统计信息
  const starStats = ref({})
  const ageRatingStats = ref({})

  // 计算属性
  const characterCount = computed(() => pagination.value.total)
  const hasCharacters = computed(() => characters.value.length > 0)

  // 获取star配置
  const getStarInfo = (star) => starConfig.getLevelInfo(star)

  // 获取age rating配置
  const getAgeRatingInfo = (rating) => ageRatingConfig.getLevelInfo(rating)

  // 获取角色列表
  const fetchCharacters = async (params = {}) => {
    isLoading.value = true
    try {
      const response = await characterApi.getCharacters({
        ...filters.value,
        ...params,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      characters.value = response.data
      pagination.value = response.pagination
      return response
    } catch (error) {
      console.error('获取角色列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取角色详情
  const fetchCharacterById = async (id) => {
    isLoading.value = true
    try {
      const response = await characterApi.getCharacterById(id)
      currentCharacter.value = response.data
      return response
    } catch (error) {
      console.error('获取角色详情失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新star
  const updateCharacterStar = async (id, star) => {
    try {
      const response = await characterApi.updateStar(id, star)

      // 更新本地状态
      const index = characters.value.findIndex((c) => c._id === id)
      if (index !== -1) {
        characters.value[index].star = star
        characters.value[index].updated_at = response.data.updated_at
      }

      if (currentCharacter.value && currentCharacter.value._id === id) {
        currentCharacter.value.star = star
        currentCharacter.value.updated_at = response.data.updated_at
      }

      return response
    } catch (error) {
      console.error('更新star失败:', error)
      throw error
    }
  }

  // 批量更新star
  const batchUpdateStar = async (ids, star) => {
    try {
      const response = await characterApi.batchUpdateStar(ids, star)

      // 更新本地状态
      ids.forEach((id) => {
        const index = characters.value.findIndex((c) => c._id === id)
        if (index !== -1) {
          characters.value[index].star = star
        }
      })

      return response
    } catch (error) {
      console.error('批量更新star失败:', error)
      throw error
    }
  }

  // 更新筛选条件
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // 重置页码
  }

  // 更新分页
  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const [starStatsRes, ageRatingStatsRes] = await Promise.all([
        characterApi.getStarStats(),
        characterApi.getAgeRatingStats(),
      ])

      starStats.value = starStatsRes.data
      ageRatingStats.value = ageRatingStatsRes.data
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  }

  // 重置状态
  const reset = () => {
    characters.value = []
    currentCharacter.value = null
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    }
    filters.value = {
      search: '',
      sortBy: 'name',
      order: 'asc',
    }
  }

  return {
    // 状态
    characters,
    currentCharacter,
    isLoading,
    pagination,
    filters,
    starStats,
    ageRatingStats,

    // 计算属性
    characterCount,
    hasCharacters,

    // 方法
    fetchCharacters,
    fetchCharacterById,
    updateCharacterStar,
    batchUpdateStar,
    updateFilters,
    updatePagination,
    fetchStats,
    getStarInfo,
    getAgeRatingInfo,
    reset,
  }
})
