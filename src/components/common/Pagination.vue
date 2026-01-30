<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      :background="true"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElPagination } from 'element-plus'

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 20,
  },
  total: {
    type: Number,
    default: 0,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
})

const emit = defineEmits(['update:page', 'update:limit', 'change'])

const currentPage = computed({
  get: () => props.page,
  set: (value) => {
    emit('update:page', value)
    emit('change', { page: value, limit: props.limit })
  },
})

const pageSize = computed({
  get: () => props.limit,
  set: (value) => {
    emit('update:limit', value)
    emit('change', { page: props.page, limit: value })
  },
})

const handleSizeChange = (size) => {
  emit('update:limit', size)
  emit('change', { page: 1, limit: size })
}

const handleCurrentChange = (page) => {
  emit('update:page', page)
  emit('change', { page, limit: props.limit })
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background-color: white;
}
</style>
