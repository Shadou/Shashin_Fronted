<template>
  <div class="star-rating">
    <el-rate
      v-model="currentStar"
      :max="5"
      :colors="starColors"
      :texts="starTexts"
      show-text
      @change="handleStarChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElRate } from 'element-plus'

const props = defineProps({
  star: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:star', 'change'])

const currentStar = ref(props.star)

const starConfig = {
  0: { color: '#ccc', text: '未收藏' },
  1: { color: '#FFD700', text: '一般' },
  2: { color: '#FFA500', text: '还行' },
  3: { color: '#FF6347', text: '不错' },
  4: { color: '#DC143C', text: '很好' },
  5: { color: '#8B0000', text: '最爱' },
}

const starColors = computed(() => {
  return Object.values(starConfig).map((config) => config.color)
})

const starTexts = computed(() => {
  return Object.values(starConfig).map((config) => config.text)
})

const handleStarChange = (value) => {
  emit('update:star', value)
  emit('change', value)
}

watch(
  () => props.star,
  (newVal) => {
    currentStar.value = newVal
  },
)
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
}
</style>
