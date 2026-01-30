import axios from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 处理请求参数
    if (config.method === 'get' && config.params) {
      // 移除undefined/null参数
      config.params = Object.fromEntries(
        Object.entries(config.params).filter(([_, v]) => v != null),
      )
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理响应格式
    if (response.data && response.data.success === false) {
      return Promise.reject(response.data)
    }
    return response.data
  },
  (error) => {
    // 统一错误处理
    const errorResponse = {
      success: false,
      message: '网络错误，请稍后重试',
      status: error.response?.status,
      data: error.response?.data,
    }

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          errorResponse.message = data?.message || '请求参数错误'
          break
        case 401:
          errorResponse.message = '未授权，请重新登录'
          // 可以在这里触发登录跳转
          break
        case 403:
          errorResponse.message = '拒绝访问'
          break
        case 404:
          errorResponse.message = '资源不存在'
          break
        case 429:
          errorResponse.message = '请求过于频繁，请稍后再试'
          break
        case 500:
          errorResponse.message = data?.message || '服务器内部错误'
          break
        default:
          errorResponse.message = `请求失败 (${status})`
      }
    } else if (error.request) {
      errorResponse.message = '网络连接失败，请检查网络设置'
    }

    console.error('API Error:', error)
    return Promise.reject(errorResponse)
  },
)

// 封装请求方法
export const http = {
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url, params) => apiClient.delete(url, { params }),
}

export default apiClient
