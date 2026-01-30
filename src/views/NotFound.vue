<template>
  <div class="not-found-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-description">抱歉，您访问的页面不存在或已被移除。</div>

      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>

        <el-button type="info" size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>

        <el-button type="success" size="large" @click="refresh">
          <el-icon><Refresh /></el-icon>
          刷新页面
        </el-button>
      </div>

      <div class="error-suggestions">
        <h3>可能您想访问：</h3>
        <div class="suggestion-links">
          <router-link to="/" class="suggestion-link">
            <el-icon><HomeFilled /></el-icon>
            首页
          </router-link>

          <router-link to="/characters" class="suggestion-link">
            <el-icon><User /></el-icon>
            角色管理
          </router-link>

          <router-link to="/xwang" class="suggestion-link">
            <el-icon><Picture /></el-icon>
            Xwang图库
          </router-link>

          <router-link to="/cosergirl" class="suggestion-link">
            <el-icon><Album /></el-icon>
            Cosergirl图库
          </router-link>

          <router-link to="/stats" class="suggestion-link">
            <el-icon><DataAnalysis /></el-icon>
            数据统计
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  HomeFilled,
  ArrowLeft,
  Refresh,
  User,
  Picture,
  Album,
  DataAnalysis,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const refresh = () => {
  window.location.reload()
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background-color: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.error-description {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.error-suggestions {
  text-align: left;
}

.error-suggestions h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.suggestion-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.suggestion-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  border: 1px solid #e9ecef;
}

.suggestion-link:hover {
  background-color: #e9ecef;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.suggestion-link .el-icon {
  font-size: 24px;
  color: #409eff;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-actions .el-button {
    width: 200px;
  }

  .suggestion-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
