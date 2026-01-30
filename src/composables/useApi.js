import { ref, onMounted, onUnmounted } from 'vue'

export function useApi(apiFunction, immediate = true, defaultParams = {}) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const abortController = ref(null)

  const execute = async (params = {}) => {
    loading.value = true
    error.value = null

    // 如果已有正在进行的请求，取消它
    if (abortController.value) {
      abortController.value.abort()
    }

    abortController.value = new AbortController()

    try {
      const response = await apiFunction({
        ...defaultParams,
        ...params,
        signal: abortController.value.signal,
      })
      data.value = response
      return response
    } catch (err) {
      if (err.name !== 'AbortError') {
        error.value = err
        console.error('API请求失败:', err)
      }
      throw err
    } finally {
      loading.value = false
      abortController.value = null
    }
  }

  const abort = () => {
    if (abortController.value) {
      abortController.value.abort()
    }
  }

  // 立即执行
  if (immediate) {
    onMounted(execute)
  }

  // 组件卸载时取消请求
  onUnmounted(abort)

  return {
    data,
    loading,
    error,
    execute,
    abort,
    reset: () => {
      data.value = null
      error.value = null
    },
  }
}

export function usePagination(apiFunction, defaultParams = {}) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const filters = ref({})

  const fetchData = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiFunction({
        ...defaultParams,
        ...filters.value,
        ...params,
        page: pagination.value.page,
        limit: pagination.value.limit,
      })

      data.value = response.data
      pagination.value = response.pagination || pagination.value
      return response
    } catch (err) {
      error.value = err
      console.error('分页数据获取失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
    return fetchData()
  }

  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
    return fetchData()
  }

  const changePage = (page) => {
    pagination.value.page = page
    return fetchData()
  }

  const changePageSize = (limit) => {
    pagination.value.limit = limit
    pagination.value.page = 1
    return fetchData()
  }

  const reset = () => {
    data.value = []
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    }
    filters.value = {}
  }

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    fetchData,
    updateFilters,
    updatePagination,
    changePage,
    changePageSize,
    reset,
  }
}

export function useSearch(searchFunction, options = {}) {
  const { debounceDelay = 300, minLength = 2, immediate = false } = options

  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')

  let debounceTimer = null

  const search = async (term = searchTerm.value) => {
    if (term.length < minLength) {
      searchResults.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const results = await searchFunction(term)
      searchResults.value = results
    } catch (err) {
      error.value = err
      console.error('搜索失败:', err)
    } finally {
      loading.value = false
    }
  }

  const debouncedSearch = (term) => {
    clearTimeout(debounceTimer)
    searchTerm.value = term

    if (term.length < minLength) {
      searchResults.value = []
      return
    }

    debounceTimer = setTimeout(() => {
      search(term)
    }, debounceDelay)
  }

  const clearSearch = () => {
    searchTerm.value = ''
    searchResults.value = []
    clearTimeout(debounceTimer)
  }

  if (immediate) {
    onMounted(() => search(searchTerm.value))
  }

  onUnmounted(() => {
    clearTimeout(debounceTimer)
  })

  return {
    searchResults,
    loading,
    error,
    searchTerm,
    search,
    debouncedSearch,
    clearSearch,
  }
}
