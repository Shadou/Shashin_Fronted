// Star评分配置
export const starConfig = {
  levels: [
    { value: 0, label: '未收藏', color: '#ccc', icon: 'Star' },
    { value: 1, label: '一般', color: '#FFD700', icon: 'StarFilled' },
    { value: 2, label: '还行', color: '#FFA500', icon: 'StarFilled' },
    { value: 3, label: '不错', color: '#FF6347', icon: 'StarFilled' },
    { value: 4, label: '很好', color: '#DC143C', icon: 'StarFilled' },
    { value: 5, label: '最爱', color: '#8B0000', icon: 'StarFilled' },
  ],

  getLevelInfo(star) {
    return this.levels.find((level) => level.value === star) || this.levels[0]
  },

  getColor(star) {
    const level = this.getLevelInfo(star)
    return level.color
  },

  getIcon(star) {
    const level = this.getLevelInfo(star)
    return level.icon
  },
}

// Age Rating分级配置
export const ageRatingConfig = {
  levels: {
    1: {
      value: 1,
      level: 'G',
      label: '全年龄',
      description: '适合所有年龄段',
      color: '#4CAF50',
      icon: 'InfoFilled',
      minAge: 0,
    },
    2: {
      value: 2,
      level: 'PG',
      label: '家长指导',
      description: '建议家长指导观看',
      color: '#2196F3',
      icon: 'WarningFilled',
      minAge: 12,
    },
    3: {
      value: 3,
      level: 'PG-13',
      label: '13岁以上',
      description: '适合13岁及以上观众',
      color: '#FF9800',
      icon: 'Warning',
      minAge: 13,
    },
    4: {
      value: 4,
      level: 'R',
      label: '限制级',
      description: '限制级，18岁以上',
      color: '#F44336',
      icon: 'CircleCloseFilled',
      minAge: 18,
    },
    5: {
      value: 5,
      level: 'NC-17',
      label: '成人内容',
      description: '仅限成人观众',
      color: '#9C27B0',
      icon: 'CircleCloseFilled',
      minAge: 21,
    },
  },

  getLevelInfo(rating) {
    return (
      this.levels[rating] || {
        value: 0,
        level: '?',
        label: '未知',
        description: '未知分级',
        color: '#9E9E9E',
        icon: 'QuestionFilled',
        minAge: 0,
      }
    )
  },

  getColor(rating) {
    const level = this.getLevelInfo(rating)
    return level.color
  },

  getIcon(rating) {
    const level = this.getLevelInfo(rating)
    return level.icon
  },
}

// 分页配置
export const paginationConfig = {
  defaultPageSize: 20,
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
}
