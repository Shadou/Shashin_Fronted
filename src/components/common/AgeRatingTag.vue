<template>
  <el-tag :type="tagType" :color="ratingInfo.color" effect="dark" class="age-rating-tag">
    <el-icon :size="16">
      <component :is="ratingInfo.icon" />
    </el-icon>
    <span class="ml-1">{{ ratingInfo.level }} - {{ ratingInfo.label }}</span>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { ElTag, ElIcon } from 'element-plus'

const props = defineProps({
  rating: {
    type: Number,
    default: 1,
  },
})

const ageRatingConfig = {
  1: {
    level: 'G',
    label: '全年龄',
    color: '#4CAF50',
    icon: 'InfoFilled',
    type: 'success',
  },
  2: {
    level: 'PG',
    label: '家长指导',
    color: '#2196F3',
    icon: 'WarningFilled',
    type: 'info',
  },
  3: {
    level: 'PG-13',
    label: '13岁以上',
    color: '#FF9800',
    icon: 'Warning',
    type: 'warning',
  },
  4: {
    level: 'R',
    label: '限制级',
    color: '#F44336',
    icon: 'CircleCloseFilled',
    type: 'danger',
  },
  5: {
    level: 'NC-17',
    label: '成人内容',
    color: '#9C27B0',
    icon: 'CircleCloseFilled',
    type: 'danger',
  },
}

const ratingInfo = computed(() => {
  return (
    ageRatingConfig[props.rating] || {
      level: '?',
      label: '未知',
      color: '#9E9E9E',
      icon: 'QuestionFilled',
      type: 'info',
    }
  )
})

const tagType = computed(() => ratingInfo.value.type)
</script>

<style scoped>
.age-rating-tag {
  display: inline-flex;
  align-items: center;
  font-weight: bold;
}
</style>
