<template>
  <div class="character-form">
    <el-card>
      <template #header>
        <div class="form-header">
          <span>{{ formTitle }}</span>
          <el-button-group>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ submitButtonText }}
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
            <el-button v-if="isEditMode" type="danger" @click="handleDelete"> 删除 </el-button>
          </el-button-group>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="large"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入角色名称"
                clearable
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="相似名称" prop="names_like">
              <el-select
                v-model="formData.names_like"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请输入相似名称"
                style="width: 100%"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄分级" prop="age_rating">
              <el-select
                v-model="formData.age_rating"
                placeholder="请选择年龄分级"
                style="width: 100%"
              >
                <el-option
                  v-for="rating in ageRatingOptions"
                  :key="rating.value"
                  :label="rating.label"
                  :value="rating.value"
                >
                  <div class="rating-option">
                    <span class="rating-icon">{{ rating.icon }}</span>
                    <span class="rating-label">{{ rating.label }}</span>
                    <span class="rating-desc">{{ rating.description }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="评分" prop="star">
              <StarRating v-model="formData.star" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入标签"
            style="width: 100%"
          >
            <el-option v-for="tag in suggestedTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
          <div class="tag-suggestions">
            <el-tag
              v-for="tag in popularTags"
              :key="tag.name"
              size="small"
              class="suggestion-tag"
              @click="addTag(tag.name)"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="创建时间" v-if="formData.created_at">
          <el-text type="info">{{ formatDate(formData.created_at) }}</el-text>
        </el-form-item>

        <el-form-item label="更新时间" v-if="formData.updated_at">
          <el-text type="info">{{ formatDate(formData.updated_at) }}</el-text>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { characterApi } from '@/api/character'
import { formatDate } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  names_like: [],
  age_rating: 1,
  star: 0,
  tags: [],
  remark: '',
})

// 验证规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  age_rating: [{ required: true, message: '请选择年龄分级', trigger: 'change' }],
}

// 年龄分级选项
const ageRatingOptions = [
  { value: 1, label: 'G - 全年龄', description: '适合所有年龄段', icon: '👶' },
  { value: 2, label: 'PG - 家长指导', description: '建议家长指导观看', icon: '👦' },
  { value: 3, label: 'PG-13 - 13岁以上', description: '适合13岁及以上观众', icon: '👨' },
  { value: 4, label: 'R - 限制级', description: '限制级，18岁以上', icon: '🔞' },
  { value: 5, label: 'NC-17 - 成人内容', description: '仅限成人观众', icon: '⚠️' },
]

// 标签建议
const suggestedTags = ref(['可爱', '萝莉', '御姐', '学生', '女仆', '和服', '泳装', 'COSPLAY'])
const popularTags = ref([
  { name: '可爱', count: 120 },
  { name: '萝莉', count: 85 },
  { name: '御姐', count: 63 },
  { name: '学生', count: 45 },
])

// 计算属性
const isEditMode = computed(() => route.name === 'CharacterEdit')
const formTitle = computed(() => (isEditMode.value ? '编辑角色' : '创建角色'))
const submitButtonText = computed(() => (submitting.value ? '保存中...' : '保存'))

// 生命周期
onMounted(async () => {
  if (isEditMode.value) {
    await loadCharacterData()
  }
})

// 方法
const loadCharacterData = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await characterApi.getCharacterById(id)
    Object.assign(formData, response.data)
  } catch (error) {
    ElMessage.error('加载角色数据失败')
    router.back()
  }
}

const addTag = (tag) => {
  if (!formData.tags.includes(tag)) {
    formData.tags.push(tag)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEditMode.value) {
      await characterApi.updateCharacter(route.params.id, formData)
      ElMessage.success('角色更新成功')
    } else {
      await characterApi.createCharacter(formData)
      ElMessage.success('角色创建成功')
    }

    router.push('/characters')
  } catch (error) {
    if (error.name === 'ValidateError') {
      ElMessage.warning('请检查表单填写是否正确')
    } else {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？此操作不可恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await characterApi.deleteCharacter(route.params.id)
    ElMessage.success('角色删除成功')
    router.push('/characters')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.character-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-icon {
  font-size: 18px;
}

.rating-label {
  font-weight: bold;
  min-width: 80px;
}

.rating-desc {
  font-size: 12px;
  color: #909399;
  flex: 1;
}

.tag-suggestions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  transform: scale(1.05);
}
</style>
