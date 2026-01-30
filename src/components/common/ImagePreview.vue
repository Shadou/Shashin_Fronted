<template>
  <div class="image-preview">
    <el-image
      :src="imageUrl"
      :preview-src-list="previewList"
      :initial-index="initialIndex"
      fit="contain"
      loading="lazy"
      :z-index="2000"
      hide-on-click-modal
    >
      <template #placeholder>
        <div class="image-skeleton">
          <el-skeleton :rows="0" animated />
        </div>
      </template>
      <template #error>
        <div class="image-error">
          <el-icon :size="24" color="#909399">
            <Picture />
          </el-icon>
          <span>图片加载失败</span>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElImage, ElSkeleton, ElIcon } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  imageIndex: {
    type: Number,
    default: 0,
  },
})

const imageUrl = computed(() => {
  if (!props.item.images || props.item.images.length === 0) return ''

  const image = props.item.images[props.imageIndex]
  if (!image) return ''

  const filename = image[0]

  // 根据数据类型构建URL
  if (props.item.xid) {
    return `/api/files/xwang/${props.item.xid}/${filename}`
  } else if (props.item._id) {
    return `/api/images/cosergirl/${props.item._id}/${filename}`
  }

  return ''
})

const previewList = computed(() => {
  if (!props.item.images) return []

  return props.item.images
    .map((img) => {
      const filename = img[0]
      if (props.item.xid) {
        return `/api/files/xwang/${props.item.xid}/${filename}`
      } else if (props.item._id) {
        return `/api/images/cosergirl/${props.item._id}/${filename}`
      }
      return ''
    })
    .filter((url) => url)
})

const initialIndex = computed(() => props.imageIndex)
</script>

<style scoped>
.image-preview {
  width: 100%;
  height: 100%;
}

.image-skeleton {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-error {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
