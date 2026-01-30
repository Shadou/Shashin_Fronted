<template>
  <div class="stats-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-statistic title="角色总数" :value="characterStats.total || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Xwang集数" :value="xwangStats.total || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Cosergirl集数" :value="cosergirlStats.total || 0" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="图片总数" :value="totalImages">
          <template #prefix>
            <el-icon><Picture /></el-icon>
          </template>
        </el-statistic>
      </el-col>
    </el-row>

    <!-- Star评分分布 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>角色Star评分分布</span>
              <el-select v-model="starChartType" size="small" style="width: 120px">
                <el-option label="饼图" value="pie" />
                <el-option label="柱状图" value="bar" />
                <el-option label="环形图" value="ring" />
              </el-select>
            </div>
          </template>
          <div ref="starChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>Xwang Star评分分布</span>
            </div>
          </template>
          <div ref="xwangStarChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Age Rating分布 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>角色Age Rating分布</span>
            </div>
          </template>
          <div ref="ratingChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>Cosergirl Star评分分布</span>
            </div>
          </template>
          <div ref="cosergirlStarChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势分析 -->
    <el-card class="trend-section">
      <template #header>
        <div class="chart-header">
          <span>更新趋势</span>
          <el-date-picker
            v-model="trendDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="width: 240px"
          />
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container"></div>
    </el-card>

    <!-- 详细统计表 -->
    <el-card class="detailed-stats">
      <template #header>
        <span>详细统计</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色统计" name="characters">
          <el-table :data="characterDetailedStats" v-loading="loading" stripe>
            <el-table-column prop="star" label="评分" width="100">
              <template #default="{ row }">
                <StarRating :star="row.star" size="small" />
              </template>
            </el-table-column>

            <el-table-column prop="age_rating" label="分级" width="120">
              <template #default="{ row }">
                <AgeRatingTag :rating="row.age_rating" size="small" />
              </template>
            </el-table-column>

            <el-table-column prop="count" label="数量" width="100" sortable />

            <el-table-column prop="percentage" label="占比" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.percentage"
                  :color="getProgressColor(row.percentage)"
                  :show-text="false"
                />
                <span class="percentage-text">{{ row.percentage }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="图库统计" name="galleries">
          <el-table :data="galleryDetailedStats" stripe>
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.type === 'xwang' ? 'success' : 'warning'">
                  {{ row.type === 'xwang' ? 'Xwang' : 'Cosergirl' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="star" label="评分" width="100">
              <template #default="{ row }">
                <StarRating :star="row.star" size="small" />
              </template>
            </el-table-column>

            <el-table-column prop="count" label="集数" width="100" sortable />

            <el-table-column prop="totalImages" label="图片数" width="120" sortable />

            <el-table-column prop="avgImages" label="平均图片数" width="120" />

            <el-table-column prop="percentage" label="占比" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.percentage"
                  :color="getProgressColor(row.percentage)"
                  :show-text="false"
                />
                <span class="percentage-text">{{ row.percentage }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Picture } from '@element-plus/icons-vue'
import { characterApi } from '@/api/character'
import { xwangApi } from '@/api/xwang'
import { cosergirlApi } from '@/api/cosergirl'
import StarRating from '@/components/common/StarRating.vue'
import AgeRatingTag from '@/components/common/AgeRatingTag.vue'

// 状态
const loading = ref(false)
const starChartType = ref('pie')
const activeTab = ref('characters')
const trendDateRange = ref([])

// 图表引用
const starChartRef = ref(null)
const ratingChartRef = ref(null)
const xwangStarChartRef = ref(null)
const cosergirlStarChartRef = ref(null)
const trendChartRef = ref(null)

// 统计数据
const characterStats = reactive({
  total: 0,
  star: {},
  age_rating: {},
})

const xwangStats = reactive({
  total: 0,
  star: {},
})

const cosergirlStats = reactive({
  total: 0,
  star: {},
})

// 计算属性
const totalImages = computed(() => {
  return xwangStats.total * 50 + cosergirlStats.total * 100
})

const characterDetailedStats = computed(() => {
  const stats = []

  // Star统计
  Object.entries(characterStats.star).forEach(([star, count]) => {
    const percentage =
      characterStats.total > 0 ? ((count / characterStats.total) * 100).toFixed(1) : 0

    stats.push({
      type: 'star',
      star: parseInt(star),
      count,
      percentage: parseFloat(percentage),
    })
  })

  // Age Rating统计
  Object.entries(characterStats.age_rating).forEach(([rating, count]) => {
    const percentage =
      characterStats.total > 0 ? ((count / characterStats.total) * 100).toFixed(1) : 0

    stats.push({
      type: 'age_rating',
      age_rating: parseInt(rating),
      count,
      percentage: parseFloat(percentage),
    })
  })

  return stats
})

const galleryDetailedStats = computed(() => {
  const stats = []

  // Xwang统计
  Object.entries(xwangStats.star).forEach(([star, count]) => {
    const percentage = xwangStats.total > 0 ? ((count / xwangStats.total) * 100).toFixed(1) : 0

    stats.push({
      type: 'xwang',
      star: parseInt(star),
      count,
      totalImages: count * 50, // 估算
      avgImages: 50,
      percentage: parseFloat(percentage),
    })
  })

  // Cosergirl统计
  Object.entries(cosergirlStats.star).forEach(([star, count]) => {
    const percentage =
      cosergirlStats.total > 0 ? ((count / cosergirlStats.total) * 100).toFixed(1) : 0

    stats.push({
      type: 'cosergirl',
      star: parseInt(star),
      count,
      totalImages: count * 100, // 估算
      avgImages: 100,
      percentage: parseFloat(percentage),
    })
  })

  return stats
})

// 图表实例
let starChart = null
let ratingChart = null
let xwangStarChart = null
let cosergirlStarChart = null
let trendChart = null

// 生命周期
onMounted(async () => {
  await loadStats()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

// 方法
const loadStats = async () => {
  loading.value = true
  try {
    const [charStats, xwangStarRes, cosergirlStarRes] = await Promise.all([
      characterApi.getCharacters({ limit: 1 }),
      xwangApi.getStarStats(),
      cosergirlApi.getStarStats(),
    ])

    characterStats.total = charStats.pagination?.total || 0
    xwangStats.total = xwangStarRes.total || 0
    cosergirlStats.total = cosergirlStarRes.total || 0

    // 加载更多统计
    const [characterStarRes, characterRatingRes] = await Promise.all([
      characterApi.getStarStats(),
      characterApi.getAgeRatingStats(),
    ])

    characterStats.star = characterStarRes.data || {}
    characterStats.age_rating = characterRatingRes.data || {}
    xwangStats.star = xwangStarRes.data || {}
    cosergirlStats.star = cosergirlStarRes.data || {}
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  if (starChartRef.value) {
    starChart = echarts.init(starChartRef.value)
    updateStarChart()
  }

  if (ratingChartRef.value) {
    ratingChart = echarts.init(ratingChartRef.value)
    updateRatingChart()
  }

  if (xwangStarChartRef.value) {
    xwangStarChart = echarts.init(xwangStarChartRef.value)
    updateXwangStarChart()
  }

  if (cosergirlStarChartRef.value) {
    cosergirlStarChart = echarts.init(cosergirlStarChartRef.value)
    updateCosergirlStarChart()
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }
}

const updateStarChart = () => {
  if (!starChart) return

  const starLabels = ['未收藏', '一般', '还行', '不错', '很好', '最爱']
  const starColors = ['#ccc', '#FFD700', '#FFA500', '#FF6347', '#DC143C', '#8B0000']

  const data = starLabels.map((label, index) => ({
    name: label,
    value: characterStats.star[index] || 0,
    itemStyle: { color: starColors[index] },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
    },
    series: [
      {
        name: 'Star评分',
        type: starChartType.value,
        radius: starChartType.value === 'ring' ? ['40%', '70%'] : '70%',
        center: starChartType.value === 'pie' ? ['50%', '50%'] : ['60%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  starChart.setOption(option)
}

const updateRatingChart = () => {
  if (!ratingChart) return

  const ratingLabels = ['G', 'PG', 'PG-13', 'R', 'NC-17']
  const ratingColors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0']

  const data = ratingLabels.map((label, index) => ({
    name: label,
    value: characterStats.age_rating[index + 1] || 0,
    itemStyle: { color: ratingColors[index] },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 'right',
      top: 'center',
    },
    series: [
      {
        name: 'Age Rating',
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: data,
        label: {
          formatter: '{b}: {c}',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  ratingChart.setOption(option)
}

const updateXwangStarChart = () => {
  if (!xwangStarChart) return

  const starLabels = ['未收藏', '一般', '还行', '不错', '很好', '最爱']
  const data = starLabels.map((label, index) => xwangStats.star[index] || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: starLabels,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Xwang Star',
        type: 'bar',
        data: data,
        itemStyle: {
          color: (params) => {
            const colors = ['#ccc', '#FFD700', '#FFA500', '#FF6347', '#DC143C', '#8B0000']
            return colors[params.dataIndex] || '#5470c6'
          },
        },
      },
    ],
  }

  xwangStarChart.setOption(option)
}

const updateCosergirlStarChart = () => {
  if (!cosergirlStarChart) return

  const starLabels = ['未收藏', '一般', '还行', '不错', '很好', '最爱']
  const data = starLabels.map((label, index) => cosergirlStats.star[index] || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: starLabels,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Cosergirl Star',
        type: 'bar',
        data: data,
        itemStyle: {
          color: (params) => {
            const colors = ['#ccc', '#FFD700', '#FFA500', '#FF6347', '#DC143C', '#8B0000']
            return colors[params.dataIndex] || '#5470c6'
          },
        },
      },
    ],
  }

  cosergirlStarChart.setOption(option)
}

const updateTrendChart = () => {
  if (!trendChart) return

  // 模拟数据
  const dates = []
  const xwangData = []
  const cosergirlData = []

  const today = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))

    // 模拟随机数据
    xwangData.push(Math.floor(Math.random() * 10))
    cosergirlData.push(Math.floor(Math.random() * 5))
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Xwang', 'Cosergirl'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Xwang',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(76, 175, 80, 0.6)',
            },
            {
              offset: 1,
              color: 'rgba(76, 175, 80, 0.1)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: xwangData,
      },
      {
        name: 'Cosergirl',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 2,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(33, 150, 243, 0.6)',
            },
            {
              offset: 1,
              color: 'rgba(33, 150, 243, 0.1)',
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: cosergirlData,
      },
    ],
  }

  trendChart.setOption(option)
}

const handleResize = () => {
  const charts = [starChart, ratingChart, xwangStarChart, cosergirlStarChart, trendChart]
  charts.forEach((chart) => {
    if (chart) {
      chart.resize()
    }
  })
}

const disposeCharts = () => {
  const charts = [starChart, ratingChart, xwangStarChart, cosergirlStarChart, trendChart]
  charts.forEach((chart) => {
    if (chart) {
      chart.dispose()
    }
  })
}

const getProgressColor = (percentage) => {
  if (percentage > 75) return '#67C23A'
  if (percentage > 50) return '#E6A23C'
  if (percentage > 25) return '#409EFF'
  return '#909399'
}

// 监听图表类型变化
watch(starChartType, () => {
  updateStarChart()
})
</script>

<style scoped>
.stats-page {
  padding: 20px;
}

.stats-cards {
  margin-bottom: 30px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.trend-section,
.detailed-stats {
  margin-bottom: 20px;
}

.percentage-text {
  margin-left: 10px;
  font-size: 12px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row .el-col {
    width: 100%;
  }

  .chart-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .stats-cards .el-col {
    width: 50%;
    margin-bottom: 20px;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
