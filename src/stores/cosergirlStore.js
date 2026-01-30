import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cosergirlApi } from '@/api/cosergirl'

export const useCosergirlStore = defineStore('cosergirl', () => {
  // 状态
  const cosergirlList = ref([])
  const currentCosergirl = ref(null)
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
    character: '',
    sortBy: 'updated_at',
    order: 'desc',
  })

  // 统计信息
  const starStats = ref({})

  // 计算属性
  const totalCount = computed(() => pagination.value.total)
  const hasItems = computed(() => cosergirlList.value.length > 0)

  // 获取列表
  const fetchCosergirlList = async (params = {}) => {
    isLoading.value = true
    try {
      const response = await cosergirlApi.getCosergirl({
        ...filters.value,
        ...params,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      cosergirlList.value = response.data
      pagination.value = response.pagination
      return response
    } catch (error) {
      console.error('获取Cosergirl列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 获取详情
  const fetchCosergirlById = async (id) => {
    isLoading.value = true
    try {
      const response = await cosergirlApi.getCosergirlById(id)
      currentCosergirl.value = response.data
      return response
    } catch (error) {
      console.error('获取Cosergirl详情失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新star
  const updateCosergirlStar = async (id, star) => {
    try {
      const response = await cosergirlApi.updateStar(id, star)

      // 更新本地状态
      const index = cosergirlList.value.findIndex((item) => item._id === id)
      if (index !== -1) {
        cosergirlList.value[index].star = star
        cosergirlList.value[index].updated_at = response.data.updated_at
      }

      if (currentCosergirl.value && currentCosergirl.value._id === id) {
        currentCosergirl.value.star = star
        currentCosergirl.value.updated_at = response.data.updated_at
      }

      return response
    } catch (error) {
      console.error('更新Cosergirl star失败:', error)
      throw error
    }
  }

  // 批量更新star
  const batchUpdateStar = async (ids, star) => {
    try {
      const response = await cosergirlApi.batchUpdateStar(ids, star)

      // 更新本地状态
      ids.forEach((id) => {
        const index = cosergirlList.value.findIndex((item) => item._id === id)
        if (index !== -1) {
          cosergirlList.value[index].star = star
        }
      })

      return response
    } catch (error) {
      console.error('批量更新Cosergirl star失败:', error)
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
      const starStatsRes = await cosergirlApi.getStarStats()
      starStats.value = starStatsRes.data
    } catch (error) {
      console.error('获取Cosergirl统计信息失败:', error)
    }
  }

  // 重置状态
  const reset = () => {
    cosergirlList.value = []
    currentCosergirl.value = null
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    }
    filters.value = {
      search: '',
      character: '',
      sortBy: 'updated_at',
      order: 'desc',
    }
  }

  return {
    // 状态
    cosergirlList,
    currentCosergirl,
    isLoading,
    pagination,
    filters,
    starStats,

    // 计算属性
    totalCount,
    hasItems,

    // 方法
    fetchCosergirlList,
    fetchCosergirlById,
    updateCosergirlStar,
    batchUpdateStar,
    updateFilters,
    updatePagination,
    fetchStats,
    reset,
  }
})
