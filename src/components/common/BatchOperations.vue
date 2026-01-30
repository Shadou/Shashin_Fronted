<template>
  <div class="batch-operations" v-if="selectedCount > 0">
    <div class="batch-panel">
      <div class="batch-info">
        <el-icon><Select /></el-icon>
        <span class="selected-count">已选择 {{ selectedCount }} 项</span>
      </div>

      <div class="batch-actions">
        <!-- Star批量操作 -->
        <el-dropdown @command="handleStarCommand" class="batch-dropdown">
          <el-button type="primary" size="small">
            <el-icon><Star /></el-icon>
            设置评分
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="level in starLevels"
                :key="level.value"
                :command="level.value"
              >
                <span class="star-option">
                  <span class="star-icon" :style="{ color: level.color }">★</span>
                  <span>{{ level.label }}</span>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Age Rating批量操作 -->
        <el-dropdown @command="handleRatingCommand" class="batch-dropdown">
          <el-button type="warning" size="small">
            <el-icon><Warning /></el-icon>
            设置分级
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="rating in ageRatings"
                :key="rating.value"
                :command="rating.value"
              >
                <span class="rating-option">
                  <span class="rating-icon">{{ rating.icon }}</span>
                  <span>{{ rating.label }}</span>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 其他操作 -->
        <el-button type="danger" size="small" :loading="deleting" @click="confirmDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>

        <el-button size="small" @click="clearSelection">
          <el-icon><Close /></el-icon>
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 批量操作进度 -->
    <div class="batch-progress" v-if="batchProgress.active">
      <el-progress
        :percentage="batchProgress.percentage"
        :status="batchProgress.status"
        :text-inside="true"
        :stroke-width="20"
      >
        <template #default="{ percentage }">
          <span class="progress-text">
            {{ batchProgress.message }}
            ({{ Math.floor(percentage) }}%)
          </span>
        </template>
      </el-progress>

      <el-button
        v-if="batchProgress.cancellable"
        type="text"
        size="small"
        @click="cancelBatchOperation"
      >
        取消
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Select, Star, Warning, Delete, Close } from '@element-plus/icons-vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => [],
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  operationType: {
    type: String,
    default: 'character', // 'character', 'xwang', 'cosergirl'
  },
})

const emit = defineEmits(['batch-update', 'delete-selected', 'clear-selection'])

// 状态
const deleting = ref(false)
const batchProgress = reactive({
  active: false,
  percentage: 0,
  message: '',
  status: '',
  cancellable: false,
})

// 配置
const starLevels = [
  { value: 0, label: '未收藏', color: '#ccc' },
  { value: 1, label: '一般', color: '#FFD700' },
  { value: 2, label: '还行', color: '#FFA500' },
  { value: 3, label: '不错', color: '#FF6347' },
  { value: 4, label: '很好', color: '#DC143C' },
  { value: 5, label: '最爱', color: '#8B0000' },
]

const ageRatings = [
  { value: 1, label: 'G - 全年龄', icon: '👶' },
  { value: 2, label: 'PG - 家长指导', icon: '👦' },
  { value: 3, label: 'PG-13 - 13岁以上', icon: '👨' },
  { value: 4, label: 'R - 限制级', icon: '🔞' },
  { value: 5, label: 'NC-17 - 成人内容', icon: '⚠️' },
]

// 计算属性
const selectedCount = computed(() => props.selectedIds.length)

// 方法
const handleStarCommand = async (starValue) => {
  try {
    await confirmBatchOperation('评分', async () => {
      emit('batch-update', {
        type: 'star',
        ids: props.selectedIds,
        value: starValue,
        operationType: props.operationType,
      })
    })
  } catch (error) {
    console.error('批量设置评分失败:', error)
  }
}

const handleRatingCommand = async (ratingValue) => {
  try {
    await confirmBatchOperation('分级', async () => {
      emit('batch-update', {
        type: 'age_rating',
        ids: props.selectedIds,
        value: ratingValue,
        operationType: props.operationType,
      })
    })
  } catch (error) {
    console.error('批量设置分级失败:', error)
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCount.value} 项吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    deleting.value = true
    await emit('delete-selected', props.selectedIds)
    ElMessage.success(`成功删除 ${selectedCount.value} 项`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleting.value = false
  }
}

const confirmBatchOperation = async (operationName, operationCallback) => {
  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedCount.value} 项进行批量${operationName}操作吗？`,
      `批量${operationName}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )

    startBatchProgress(`${operationName}设置中...`)
    await operationCallback()
    completeBatchProgress(`${operationName}设置完成`)
  } catch (error) {
    if (error !== 'cancel') {
      failBatchProgress(`${operationName}设置失败`)
      throw error
    }
  }
}

const clearSelection = () => {
  emit('clear-selection')
}

const startBatchProgress = (message, cancellable = true) => {
  batchProgress.active = true
  batchProgress.percentage = 0
  batchProgress.message = message
  batchProgress.status = ''
  batchProgress.cancellable = cancellable

  // 模拟进度更新
  const interval = setInterval(() => {
    if (batchProgress.percentage < 90) {
      batchProgress.percentage += 10
    } else {
      clearInterval(interval)
    }
  }, 200)
}

const updateBatchProgress = (percentage, message) => {
  batchProgress.percentage = percentage
  if (message) {
    batchProgress.message = message
  }
}

const completeBatchProgress = (message = '操作完成') => {
  batchProgress.percentage = 100
  batchProgress.message = message
  batchProgress.status = 'success'
  batchProgress.cancellable = false

  setTimeout(() => {
    batchProgress.active = false
  }, 1500)
}

const failBatchProgress = (message = '操作失败') => {
  batchProgress.message = message
  batchProgress.status = 'exception'
  batchProgress.cancellable = false

  setTimeout(() => {
    batchProgress.active = false
  }, 2000)
}

const cancelBatchOperation = () => {
  batchProgress.active = false
  ElMessage.info('批量操作已取消')
}
</script>

<style scoped>
.batch-operations {
  position: sticky;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 20px;
  margin-top: 20px;
}

.batch-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slide-up 0.3s ease;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.selected-count {
  font-size: 16px;
}

.batch-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.batch-dropdown {
  margin-right: 10px;
}

.star-option,
.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.star-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.rating-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.batch-progress {
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.batch-progress .el-progress {
  flex: 1;
}

.progress-text {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .batch-operations {
    padding: 0 10px;
  }

  .batch-panel {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .batch-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
