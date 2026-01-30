// 角色类型
interface Character {
  _id: string
  id: number
  name: string
  names_like: string[]
  age_rating: 1 | 2 | 3 | 4 | 5
  tags: string[]
  star: 0 | 1 | 2 | 3 | 4 | 5
  remark?: string
  created_at: string
  updated_at: string
}

// Xwang类型
interface Xwang {
  _id: string
  xid: string
  character: string
  title: string
  size: number
  count: number
  images: Array<[string, string]>
  star: 0 | 1 | 2 | 3 | 4 | 5
  created_at: string
  updated_at: string
  character_id?: number
  character_old?: string
}

// Cosergirl类型
interface Cosergirl {
  _id: string
  character: string
  title: string
  path: string
  count: number
  size: number
  images: Array<[string, string]>
  star: 0 | 1 | 2 | 3 | 4 | 5
  character_id?: number
  character_old?: string
  created_at?: string
  updated_at?: string
}

// 图片信息
interface ImageInfo {
  filename: string
  size: string
  url: string
  urlStatic?: string
  urlProxy?: string
  urlById?: string
}

// 分页响应
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// 单条数据响应
interface SingleResponse<T> {
  success: boolean
  data: T
}

// 错误响应
interface ErrorResponse {
  success: false
  message: string
  status?: number
  data?: any
}

// 统计信息
interface StarStats {
  [star: number]: number
  total: number
  description: {
    [star: number]: string
  }
}

interface AgeRatingStats {
  [rating: number]: number
  total: number
  descriptions: {
    [rating: number]: {
      level: string
      description: string
      min_age: number
      color: string
      icon: string
    }
  }
}

// API请求参数
interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

interface SearchParams extends PaginationParams {
  search?: string
  character?: string
}

interface FilterParams extends PaginationParams {
  age_rating?: number
  star?: number
}

// 批量操作
interface BatchUpdate {
  ids: string[]
  star?: number
  age_rating?: number
}

// 用户信息
interface User {
  _id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  created_at: string
  last_login: string
}

// 系统设置
interface SystemSettings {
  theme: 'light' | 'dark'
  language: 'zh' | 'en'
  pageSize: number
  enableCache: boolean
  imageQuality: 'low' | 'medium' | 'high'
  autoSave: boolean
}

// 标签统计
interface TagStats {
  name: string
  count: number
  usage_rate: number
}
