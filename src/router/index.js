import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/characters',
    name: 'Characters',
    component: () => import('@/views/character/CharacterList.vue'),
    meta: { title: '角色管理' },
  },
  {
    path: '/characters/:id',
    name: 'CharacterDetail',
    component: () => import('@/views/character/CharacterDetail.vue'),
    meta: { title: '角色详情' },
  },
  {
    path: '/characters/create',
    name: 'CharacterCreate',
    component: () => import('@/views/character/CharacterForm.vue'),
    meta: { title: '创建角色' },
  },
  {
    path: '/characters/edit/:id',
    name: 'CharacterEdit',
    component: () => import('@/views/character/CharacterForm.vue'),
    meta: { title: '编辑角色' },
  },
  {
    path: '/xwang',
    name: 'Xwang',
    component: () => import('@/views/xwang/XwangList.vue'),
    meta: { title: 'Xwang图库' },
  },
  {
    path: '/xwang/:id',
    name: 'XwangDetail',
    component: () => import('@/views/xwang/XwangDetail.vue'),
    meta: { title: 'Xwang详情' },
  },
  {
    path: '/cosergirl',
    name: 'Cosergirl',
    component: () => import('@/views/cosergirl/CosergirlList.vue'),
    meta: {
      title: 'Cosergirl图库',
      keepAlive: true, // 确保使用keep-alive
    },
  },
  {
    path: '/cosergirl/:id',
    name: 'CosergirlDetail',
    component: () => import('@/views/cosergirl/CosergirlDetail.vue'),
    meta: { title: 'Cosergirl详情' },
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats.vue'),
    meta: { title: '数据统计' },
  },
  {
    path: '/debug',
    name: 'Debug',
    component: () => import('@/views/Debug.vue'),
    meta: { title: '调试工具' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title || 'Coser Gallery'
  document.title = `${title} - Coser Gallery`
  next()
})

// 添加全局后置钩子
router.afterEach((to, from) => {
  // 如果是不同的路由，可以在这里触发一些重置逻辑
  if (to.path !== from.path) {
    // 可以在这里触发全局状态重置
    console.log(`路由切换: ${from.path} -> ${to.path}`)
  }
})

export default router
