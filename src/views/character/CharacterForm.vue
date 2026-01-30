<template>
  <div class="character-form">
    <div class="form-container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button type="text" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <!-- 表单卡片 -->
      <el-card class="form-card">
        <template #header>
          <div class="form-header">
            <h2 class="form-title">{{ isEditMode ? '编辑角色' : '创建角色' }}</h2>
            <div class="form-actions">
              <el-button @click="goBack">取消</el-button>
              <el-button type="primary" @click="submitForm" :loading="submitting">
                {{ isEditMode ? '保存' : '创建' }}
              </el-button>
              <el-button v-if="isEditMode" type="danger" @click="deleteCharacter"> 删除 </el-button>
            </div>
          </div>
        </template>

        <!-- 表单内容 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="top"
          @submit.prevent="submitForm"
        >
          <el-row :gutter="30">
            <el-col :span="12">
              <!-- 基本信息 -->
              <div class="form-section">
                <h3 class="section-title">基本信息</h3>

                <el-form-item label="角色名称" prop="name">
                  <el-input
                    v-model="form.name"
                    placeholder="请输入角色名称"
                    maxlength="50"
                    show-word-limit
                    clearable
                  />
                </el-form-item>

                <el-form-item label="相似名称" prop="names_like">
                  <el-select
                    v-model="form.names_like"
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
                  <div class="form-tip">可添加多个相似名称，用于搜索匹配</div>
                </el-form-item>

                <el-form-item label="年龄分级" prop="age_rating">
                  <el-select
                    v-model="form.age_rating"
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
                        <span class="rating-description">{{ rating.description }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="评分" prop="star">
                  <StarRating v-model="form.star" />
                </el-form-item>
              </div>
            </el-col>

            <el-col :span="12">
              <!-- 标签和备注 -->
              <div class="form-section">
                <h3 class="section-title">标签和备注</h3>

                <el-form-item label="标签" prop="tags">
                  <el-select
                    v-model="form.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请输入标签"
                    style="width: 100%"
                  >
                    <el-option v-for="tag in tagSuggestions" :key="tag" :label="tag" :value="tag" />
                  </el-select>

                  <div class="tag-suggestions">
                    <div class="suggestions-title">热门标签:</div>
                    <div class="suggestion-tags">
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
                  </div>
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                  <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入备注信息"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <!-- 时间信息 -->
                <div v-if="isEditMode" class="time-info">
                  <div class="time-item">
                    <span class="time-label">创建时间:</span>
                    <span class="time-value">{{ formatDate(form.created_at) }}</span>
                  </div>
                  <div class="time-item">
                    <span class="time-label">更新时间:</span>
                    <span class="time-value">{{ formatDate(form.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 预览区域 -->
          <div class="preview-section">
            <h3 class="section-title">预览</h3>

            <el-card class="preview-card">
              <div class="preview-content">
                <div class="preview-header">
                  <div class="preview-name">{{ form.name || '角色名称' }}</div>
                  <div class="preview-rating">
                    <StarRating :star="form.star" />
                  </div>
                </div>

                <div class="preview-body">
                  <div class="preview-item">
                    <span class="preview-label">相似名称:</span>
                    <span class="preview-value">
                      {{ form.names_like?.join(', ') || '无' }}
                    </span>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">年龄分级:</span>
                    <span class="preview-value">
                      <AgeRatingTag :rating="form.age_rating" />
                    </span>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">标签:</span>
                    <div class="preview-tags">
                      <el-tag v-for="tag in form.tags" :key="tag" size="small" class="preview-tag">
                        {{ tag }}
                      </el-tag>
                      <el-tag v-if="!form.tags || form.tags.length === 0" size="small" type="info">
                        无
                      </el-tag>
                    </div>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">备注:</span>
                    <div class="preview-remark">
                      {{ form.remark || '无备注' }}
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, User } from '@element-plus/icons-vue'

import { characterApi } from '@/api/character'
import { formatDate } from '@/utils'
import StarRating from '@/components/common/StarRating.vue'
import AgeRatingTag from '@/components/common/AgeRatingTag.vue'

const route = useRoute()
const router = useRouter()

// 表单引用
const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  names_like: [],
  age_rating: 1,
  star: 0,
  tags: [],
  remark: '',
})

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  age_rating: [{ required: true, message: '请选择年龄分级', trigger: 'change' }],
}

// 选项配置
const ageRatingOptions = [
  { value: 1, label: 'G - 全年龄', description: '适合所有年龄段', icon: '👶' },
  { value: 2, label: 'PG - 家长指导', description: '建议家长指导观看', icon: '👦' },
  { value: 3, label: 'PG-13 - 13岁以上', description: '适合13岁及以上观众', icon: '👨' },
  { value: 4, label: 'R - 限制级', description: '限制级，18岁以上', icon: '🔞' },
  { value: 5, label: 'NC-17 - 成人内容', description: '仅限成人观众', icon: '⚠️' },
]

// 标签建议
const tagSuggestions = ref([
  '可爱',
  '萝莉',
  '御姐',
  '学生',
  '女仆',
  '和服',
  '泳装',
  'COSPLAY',
  '古风',
  '现代',
])
const popularTags = ref([
  { name: '可爱', count: 120 },
  { name: '萝莉', count: 85 },
  { name: '御姐', count: 63 },
  { name: '学生', count: 45 },
  { name: '女仆', count: 38 },
])

// 计算属性
const isEditMode = computed(() => route.name === 'CharacterEdit')

// 生命周期
onMounted(async () => {
  if (isEditMode.value) {
    await loadCharacter()
  }
})

// 方法
const loadCharacter = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await characterApi.getCharacterById(id)
    Object.assign(form, response.data)
  } catch (error) {
    ElMessage.error('加载角色信息失败')
    router.back()
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    submitting.value = true

    if (isEditMode.value) {
      // 更新角色
      await characterApi.updateCharacter(route.params.id, form)
      ElMessage.success('角色更新成功')
    } else {
      // 创建角色
      const response = await characterApi.createCharacter(form)
      ElMessage.success('角色创建成功')

      // 跳转到新创建的角色详情页
      router.push({ name: 'CharacterDetail', params: { id: response.data._id } })
      return
    }

    // 返回角色列表
    router.push('/characters')
  } catch (error) {
    if (error.name !== 'ValidateError') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const deleteCharacter = async () => {
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

const goBack = () => {
  router.back()
}

const addTag = (tag) => {
  if (!form.tags.includes(tag)) {
    form.tags = [...form.tags, tag]
  }
}
</script>

<style scoped>
.character-form {
  padding: 20px;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.form-title {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.rating-icon {
  font-size: 18px;
  width: 30px;
  text-align: center;
}

.rating-label {
  font-weight: bold;
  min-width: 80px;
}

.rating-description {
  font-size: 12px;
  color: #999;
  flex: 1;
}

.tag-suggestions {
  margin-top: 10px;
}

.suggestions-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  transform: scale(1.05);
}

.time-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.time-item:last-child {
  margin-bottom: 0;
}

.time-label {
  color: #666;
}

.time-value {
  color: #333;
}

.preview-section {
  margin-top: 30px;
}

.preview-card {
  border: 1px dashed #e4e7ed;
  background-color: #fafafa;
}

.preview-content {
  padding: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preview-item {
  display: flex;
  align-items: flex-start;
}

.preview-label {
  font-weight: bold;
  color: #666;
  min-width: 100px;
  margin-right: 20px;
}

.preview-value {
  flex: 1;
  color: #333;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-remark {
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions {
    justify-content: center;
  }

  .preview-item {
    flex-direction: column;
    gap: 4px;
  }

  .preview-label {
    min-width: auto;
    margin-right: 0;
  }
}
</style>
