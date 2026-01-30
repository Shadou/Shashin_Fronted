<template>
  <div class="app-footer">
    <div class="footer-container">
      <div class="footer-bottom">
        <div class="copyright">
          © 2024 Coser Gallery. All rights reserved.
          <span class="version">v2.0.0</span>
        </div>

        <div class="footer-actions">
          <el-button type="text" size="small" @click="goToHelp">帮助中心</el-button>
          <el-button type="text" size="small" @click="goToAbout">关于我们</el-button>
          <el-button type="text" size="small" @click="goToPrivacy">隐私政策</el-button>
          <el-button type="text" size="small" @click="goToTerms">服务条款</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHelp = () => {
  router.push('/help')
}

const goToAbout = () => {
  router.push('/about')
}

const goToPrivacy = () => {
  router.push('/privacy')
}

const goToTerms = () => {
  router.push('/terms')
}
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #1a2b3c 0%, #0d1b2a 100%);
  color: white;
  padding: 40px 0 20px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: white;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #409eff;
}

.section-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-link:hover {
  color: #409eff;
  transform: translateX(5px);
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.contact-item .el-icon {
  color: #409eff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.version {
  margin-left: 10px;
  padding: 2px 8px;
  background-color: rgba(64, 158, 255, 0.2);
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
}

.footer-actions {
  display: flex;
  gap: 20px;
}

.footer-actions .el-button {
  color: rgba(255, 255, 255, 0.6);
  padding: 0;
  height: auto;
}

.footer-actions .el-button:hover {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
}
</style>
