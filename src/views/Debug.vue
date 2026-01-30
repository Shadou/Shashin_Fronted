<template>
  <div class="debug-page">
    <h1>调试工具</h1>

    <el-row :gutter="20" class="tool-row">
      <el-col :span="12">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <span>路径调试</span>
            </div>
          </template>

          <el-form :model="pathForm" label-width="100px">
            <el-form-item label="路径">
              <el-input
                v-model="pathForm.path"
                placeholder="输入cosergirl路径"
                @keyup.enter="checkPath"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="checkPath" :loading="checkingPath">
                检查路径
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="pathResult" class="result-section">
            <h3>检查结果</h3>
            <pre class="result-json">{{ JSON.stringify(pathResult, null, 2) }}</pre>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <span>API测试</span>
            </div>
          </template>

          <el-form :model="apiForm" label-width="100px">
            <el-form-item label="API端点">
              <el-input v-model="apiForm.endpoint" placeholder="/api/characters" />
            </el-form-item>

            <el-form-item label="方法">
              <el-select v-model="apiForm.method">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="PATCH" value="PATCH" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </el-form-item>

            <el-form-item label="请求体" v-if="apiForm.method !== 'GET'">
              <el-input
                v-model="apiForm.body"
                type="textarea"
                :rows="3"
                placeholder='{"key": "value"}'
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="testApi" :loading="testingApi"> 测试API </el-button>
            </el-form-item>
          </el-form>

          <div v-if="apiResult" class="result-section">
            <h3>API响应</h3>
            <div class="status-badge">
              状态码:
              <el-tag :type="apiResult.status < 400 ? 'success' : 'danger'">
                {{ apiResult.status }}
              </el-tag>
            </div>
            <pre class="result-json">{{ JSON.stringify(apiResult.data, null, 2) }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="tool-row">
      <el-col :span="12">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>

          <div class="system-info">
            <div class="info-item">
              <span class="label">Node版本:</span>
              <span class="value">{{ systemInfo.nodeVersion }}</span>
            </div>

            <div class="info-item">
              <span class="label">NPM版本:</span>
              <span class="value">{{ systemInfo.npmVersion }}</span>
            </div>

            <div class="info-item">
              <span class="label">Vite版本:</span>
              <span class="value">{{ systemInfo.viteVersion }}</span>
            </div>

            <div class="info-item">
              <span class="label">Vue版本:</span>
              <span class="value">{{ systemInfo.vueVersion }}</span>
            </div>

            <div class="info-item">
              <span class="label">操作系统:</span>
              <span class="value">{{ systemInfo.os }}</span>
            </div>

            <div class="info-item">
              <span class="label">内存使用:</span>
              <span class="value">{{ systemInfo.memory }}</span>
            </div>

            <div class="info-item">
              <span class="label">环境:</span>
              <span class="value">{{ systemInfo.env }}</span>
            </div>

            <div class="info-item">
              <span class="label">时间:</span>
              <span class="value">{{ systemInfo.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <span>存储信息</span>
            </div>
          </template>

          <div class="storage-info">
            <div class="storage-item">
              <div class="storage-header">
                <span>本地存储</span>
                <el-button size="small" @click="clearLocalStorage" type="danger" plain>
                  清空
                </el-button>
              </div>

              <div class="storage-content">
                <div v-for="(value, key) in localStorageItems" :key="key" class="storage-row">
                  <span class="storage-key">{{ key }}</span>
                  <span class="storage-value">{{ truncateValue(value) }}</span>
                  <el-button size="mini" type="text" @click="removeFromStorage(key)">
                    删除
                  </el-button>
                </div>

                <div v-if="Object.keys(localStorageItems).length === 0" class="empty-storage">
                  本地存储为空
                </div>
              </div>
            </div>

            <div class="storage-item">
              <div class="storage-header">
                <span>会话存储</span>
                <el-button size="small" @click="clearSessionStorage" type="danger" plain>
                  清空
                </el-button>
              </div>

              <div class="storage-content">
                <div v-for="(value, key) in sessionStorageItems" :key="key" class="storage-row">
                  <span class="storage-key">{{ key }}</span>
                  <span class="storage-value">{{ truncateValue(value) }}</span>
                  <el-button size="mini" type="text" @click="removeFromStorage(key, 'session')">
                    删除
                  </el-button>
                </div>

                <div v-if="Object.keys(sessionStorageItems).length === 0" class="empty-storage">
                  会话存储为空
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="tool-row">
      <el-col :span="24">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <span>日志查看器</span>
              <el-button-group>
                <el-button size="small" @click="clearLogs">清空日志</el-button>
                <el-button size="small" @click="copyLogs">复制日志</el-button>
                <el-button size="small" @click="downloadLogs">下载日志</el-button>
              </el-button-group>
            </div>
          </template>

          <div class="log-controls">
            <el-input
              v-model="logFilter"
              placeholder="过滤日志"
              clearable
              size="small"
              style="width: 200px; margin-right: 10px"
            />

            <el-select v-model="logLevel" placeholder="日志级别" size="small" style="width: 120px">
              <el-option label="全部" value="all" />
              <el-option label="信息" value="info" />
              <el-option label="警告" value="warn" />
              <el-option label="错误" value="error" />
            </el-select>
          </div>

          <div class="log-container">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-entry"
              :class="log.level"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.data" class="log-data">
                {{ truncateValue(log.data) }}
              </span>
            </div>

            <div v-if="filteredLogs.length === 0" class="empty-logs">没有日志记录</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 路径调试
const pathForm = reactive({
  path: '',
})

const checkingPath = ref(false)
const pathResult = ref(null)

// API测试
const apiForm = reactive({
  endpoint: '',
  method: 'GET',
  body: '',
})

const testingApi = ref(false)
const apiResult = ref(null)

// 系统信息
const systemInfo = reactive({
  nodeVersion: '',
  npmVersion: '',
  viteVersion: '',
  vueVersion: '',
  os: '',
  memory: '',
  env: '',
  time: '',
})

// 存储信息
const localStorageItems = ref({})
const sessionStorageItems = ref({})

// 日志
const logFilter = ref('')
const logLevel = ref('all')
const logs = ref([
  { time: new Date().toLocaleTimeString(), level: 'info', message: '调试页面加载' },
])

// 计算属性
const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const matchesLevel = logLevel.value === 'all' || log.level === logLevel.value
    const matchesFilter =
      !logFilter.value ||
      log.message.toLowerCase().includes(logFilter.value.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(logFilter.value.toLowerCase()))
    return matchesLevel && matchesFilter
  })
})

// 生命周期
onMounted(() => {
  loadSystemInfo()
  loadStorageInfo()
  setupLogging()
})

// 方法
const checkPath = async () => {
  if (!pathForm.path.trim()) {
    ElMessage.warning('请输入路径')
    return
  }

  checkingPath.value = true
  addLog('info', '开始检查路径', { path: pathForm.path })

  try {
    // 这里应该调用API检查路径
    // 暂时模拟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    pathResult.value = {
      requested: pathForm.path,
      decoded: decodeURIComponent(pathForm.path),
      exists: Math.random() > 0.5,
      isDirectory: true,
      files: ['001.jpg', '002.jpg', '003.jpg'],
    }

    addLog('info', '路径检查完成', pathResult.value)
  } catch (error) {
    addLog('error', '路径检查失败', error.message)
    ElMessage.error('路径检查失败')
  } finally {
    checkingPath.value = false
  }
}

const testApi = async () => {
  if (!apiForm.endpoint.trim()) {
    ElMessage.warning('请输入API端点')
    return
  }

  testingApi.value = true
  addLog('info', '开始API测试', apiForm)

  try {
    const options = {
      method: apiForm.method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (apiForm.method !== 'GET' && apiForm.body) {
      options.body = apiForm.body
    }

    const response = await fetch(apiForm.endpoint, options)
    const data = await response.json()

    apiResult.value = {
      status: response.status,
      data: data,
    }

    addLog('info', 'API测试完成', apiResult.value)
  } catch (error) {
    addLog('error', 'API测试失败', error.message)
    ElMessage.error('API测试失败')
  } finally {
    testingApi.value = false
  }
}

// 修改 Debug.vue 中的 loadSystemInfo 方法
const loadSystemInfo = () => {
  // 模拟系统信息
  systemInfo.nodeVersion = process.env.NODE_ENV === 'production' ? '14.17.0' : '18.0.0'
  systemInfo.npmVersion = '8.0.0'
  systemInfo.viteVersion = '5.0.8'
  systemInfo.vueVersion = '3.3.8'
  systemInfo.os = navigator.platform

  // 安全地获取内存信息
  if (performance && performance.memory) {
    systemInfo.memory = `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
  } else {
    systemInfo.memory = 'N/A (仅Chrome支持)'
  }

  systemInfo.env = process.env.NODE_ENV || 'development'
  systemInfo.time = new Date().toLocaleString()
}

const loadStorageInfo = () => {
  // 加载本地存储
  localStorageItems.value = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    try {
      localStorageItems.value[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      localStorageItems.value[key] = localStorage.getItem(key)
    }
  }

  // 加载会话存储
  sessionStorageItems.value = {}
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    try {
      sessionStorageItems.value[key] = JSON.parse(sessionStorage.getItem(key))
    } catch {
      sessionStorageItems.value[key] = sessionStorage.getItem(key)
    }
  }
}

const setupLogging = () => {
  // 拦截console
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error

  console.log = function (...args) {
    addLog('info', args[0], args.slice(1))
    originalLog.apply(console, args)
  }

  console.warn = function (...args) {
    addLog('warn', args[0], args.slice(1))
    originalWarn.apply(console, args)
  }

  console.error = function (...args) {
    addLog('error', args[0], args.slice(1))
    originalError.apply(console, args)
  }
}

const addLog = (level, message, data = null) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    level,
    message,
    data,
  })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

const clearLocalStorage = () => {
  localStorage.clear()
  localStorageItems.value = {}
  addLog('info', '本地存储已清空')
  ElMessage.success('本地存储已清空')
}

const clearSessionStorage = () => {
  sessionStorage.clear()
  sessionStorageItems.value = {}
  addLog('info', '会话存储已清空')
  ElMessage.success('会话存储已清空')
}

const removeFromStorage = (key, type = 'local') => {
  if (type === 'local') {
    localStorage.removeItem(key)
    delete localStorageItems.value[key]
  } else {
    sessionStorage.removeItem(key)
    delete sessionStorageItems.value[key]
  }

  addLog('info', `已删除${type === 'local' ? '本地' : '会话'}存储项`, { key })
  ElMessage.success('已删除')
}

const clearLogs = () => {
  logs.value = []
  addLog('info', '日志已清空')
  ElMessage.success('日志已清空')
}

const copyLogs = () => {
  const logText = logs.value
    .map(
      (log) =>
        `${log.time} [${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`,
    )
    .join('\n')

  navigator.clipboard
    .writeText(logText)
    .then(() => {
      ElMessage.success('日志已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const downloadLogs = () => {
  const logText = logs.value
    .map(
      (log) =>
        `${log.time} [${log.level.toUpperCase()}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`,
    )
    .join('\n')

  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `debug_logs_${new Date().getTime()}.txt`
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('日志已下载')
}

const truncateValue = (value, maxLength = 50) => {
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.debug-page {
  padding: 20px;
}

.debug-page h1 {
  margin-bottom: 20px;
  color: #333;
}

.tool-row {
  margin-bottom: 20px;
}

.tool-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-section {
  margin-top: 20px;
}

.result-json {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
}

.status-badge {
  margin-bottom: 10px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: bold;
  color: #666;
}

.info-item .value {
  color: #333;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.storage-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e4e7ed;
}

.storage-content {
  max-height: 200px;
  overflow-y: auto;
}

.storage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.storage-row:last-child {
  border-bottom: none;
}

.storage-key {
  font-weight: bold;
  color: #409eff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.storage-value {
  color: #666;
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.empty-storage {
  padding: 20px;
  text-align: center;
  color: #999;
}

.log-controls {
  margin-bottom: 10px;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.info {
  background-color: #f0f9ff;
}

.log-entry.warn {
  background-color: #fff7e6;
}

.log-entry.error {
  background-color: #fff0f0;
}

.log-time {
  color: #999;
  min-width: 80px;
  margin-right: 10px;
}

.log-level {
  font-weight: bold;
  min-width: 40px;
  margin-right: 10px;
}

.log-entry.info .log-level {
  color: #1890ff;
}

.log-entry.warn .log-level {
  color: #faad14;
}

.log-entry.error .log-level {
  color: #ff4d4f;
}

.log-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
}

.log-data {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.empty-logs {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
