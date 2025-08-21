# 前端性能优化指南

## 🎯 学习目标

通过本章节的学习，你将掌握：
- 前端性能优化的核心指标和方法
- Vue3 + Vite 项目的性能优化技巧
- 构建优化和运行时优化策略
- 性能监控和分析工具的使用

## 📊 性能指标体系

### Core Web Vitals

```javascript
// 核心性能指标
const performanceMetrics = {
  // 最大内容绘制 (LCP) - 应 < 2.5s
  LCP: 'Largest Contentful Paint',
  
  // 首次输入延迟 (FID) - 应 < 100ms
  FID: 'First Input Delay',
  
  // 累积布局偏移 (CLS) - 应 < 0.1
  CLS: 'Cumulative Layout Shift',
  
  // 首次内容绘制 (FCP) - 应 < 1.8s
  FCP: 'First Contentful Paint',
  
  // 交互时间 (TTI) - 应 < 3.8s
  TTI: 'Time to Interactive'
}

// 性能监控代码
function measurePerformance() {
  // 使用 Performance Observer API
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      switch (entry.entryType) {
        case 'largest-contentful-paint':
          console.log('LCP:', entry.startTime)
          break
        case 'first-input':
          console.log('FID:', entry.processingStart - entry.startTime)
          break
        case 'layout-shift':
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value)
          }
          break
      }
    }
  })

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
}
```

### 自定义性能指标

```javascript
// 自定义性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }

  // 开始计时
  start(name) {
    this.startTimes.set(name, performance.now())
  }

  // 结束计时
  end(name) {
    const startTime = this.startTimes.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.set(name, duration)
      this.startTimes.delete(name)
      return duration
    }
  }

  // 标记关键时间点
  mark(name) {
    performance.mark(name)
  }

  // 测量两个标记之间的时间
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name, 'measure')[0]
    return measure.duration
  }

  // 获取所有指标
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  // 发送指标到监控服务
  sendMetrics() {
    const metrics = this.getMetrics()
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: location.href,
        userAgent: navigator.userAgent,
        metrics,
        timestamp: Date.now()
      })
    })
  }
}

// 使用示例
const monitor = new PerformanceMonitor()

// 监控组件渲染时间
monitor.start('component-render')
// ... 组件渲染逻辑
monitor.end('component-render')

// 监控API请求时间
monitor.start('api-request')
fetch('/api/data')
  .then(() => monitor.end('api-request'))
```

## ⚡ Vue3 性能优化

### 组件优化

```vue
<!-- 使用 v-memo 缓存渲染结果 -->
<template>
  <div v-memo="[user.id, user.name]">
    <UserCard :user="user" />
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'

// 异步组件懒加载
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: () => import('./LoadingComponent.vue'),
  errorComponent: () => import('./ErrorComponent.vue'),
  delay: 200,
  timeout: 3000
})

// 计算属性缓存
const expensiveValue = computed(() => {
  // 复杂计算逻辑
  return heavyCalculation(props.data)
})

// 使用 shallowRef 减少响应式开销
const shallowData = shallowRef({
  items: [],
  metadata: {}
})

// 使用 markRaw 标记非响应式对象
const nonReactiveData = markRaw({
  config: {},
  constants: {}
})
</script>
```

### 虚拟滚动优化

```vue
<!-- 虚拟滚动组件 -->
<template>
  <div 
    ref="containerRef"
    class="virtual-scroll-container"
    @scroll="handleScroll"
    :style="{ height: containerHeight + 'px' }"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div 
        :style="{ 
          transform: `translateY(${offsetY}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
          class="virtual-item"
        >
          <slot :item="item" :index="item.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: Array,
  itemHeight: { type: Number, default: 50 },
  containerHeight: { type: Number, default: 400 },
  overscan: { type: Number, default: 5 }
})

const containerRef = ref()
const scrollTop = ref(0)

// 计算可见范围
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = Math.min(
    start + Math.ceil(props.containerHeight / props.itemHeight) + props.overscan,
    props.items.length
  )
  return { start: Math.max(0, start - props.overscan), end }
})

// 可见项目
const visibleItems = computed(() => {
  const { start, end } = visibleRange.value
  return props.items.slice(start, end).map((item, index) => ({
    ...item,
    index: start + index
  }))
})

// 总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 偏移量
const offsetY = computed(() => visibleRange.value.start * props.itemHeight)

// 滚动处理（使用节流）
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollTop.value = containerRef.value?.scrollTop || 0
      ticking = false
    })
    ticking = true
  }
}
</script>
```

### 状态管理优化

```javascript
// Pinia store 优化
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

export const useOptimizedStore = defineStore('optimized', () => {
  // 使用 shallowRef 减少深度响应式
  const largeDataSet = shallowRef([])
  
  // 分页数据管理
  const currentPage = ref(1)
  const pageSize = ref(20)
  
  // 计算属性缓存
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return largeDataSet.value.slice(start, end)
  })
  
  // 批量更新
  const batchUpdate = (updates) => {
    // 暂停响应式更新
    const oldData = largeDataSet.value
    largeDataSet.value = oldData.map(item => {
      const update = updates.find(u => u.id === item.id)
      return update ? { ...item, ...update } : item
    })
  }
  
  // 内存清理
  const cleanup = () => {
    largeDataSet.value = []
  }
  
  return {
    largeDataSet,
    currentPage,
    pageSize,
    paginatedData,
    batchUpdate,
    cleanup
  }
})
```

## 🏗️ Vite 构建优化

### 基础配置优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      // 启用响应式语法糖
      reactivityTransform: true,
      // 自定义块处理
      customElement: true
    })
  ],
  
  // 构建优化
  build: {
    // 目标浏览器
    target: 'es2015',
    
    // 代码分割
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // 第三方库单独打包
          vendor: ['vue', 'vue-router', 'pinia'],
          // UI 组件库单独打包
          ui: ['element-plus'],
          // 工具库单独打包
          utils: ['lodash-es', 'dayjs']
        },
        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true
      }
    },
    
    // 生成 source map
    sourcemap: false,
    
    // 资源内联阈值
    assetsInlineLimit: 4096
  },
  
  // 开发服务器优化
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/components/*.vue']
    }
  },
  
  // 依赖预构建
  optimizeDeps: {
    // 包含的依赖
    include: ['vue', 'vue-router', 'pinia'],
    // 排除的依赖
    exclude: ['@vueuse/core']
  },
  
  // 别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src/components')
    }
  }
})
```

### 高级构建优化

```javascript
// 动态导入优化
const routes = [
  {
    path: '/',
    component: () => import(
      /* webpackChunkName: "home" */ 
      './views/Home.vue'
    )
  },
  {
    path: '/about',
    component: () => import(
      /* webpackChunkName: "about" */ 
      './views/About.vue'
    )
  }
]

// 预加载关键资源
const preloadCriticalComponents = () => {
  // 预加载首屏组件
  import('./components/Header.vue')
  import('./components/Navigation.vue')
  
  // 预加载可能访问的页面
  setTimeout(() => {
    import('./views/Dashboard.vue')
  }, 2000)
}

// 资源优先级控制
const loadResourceWithPriority = (url, priority = 'low') => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  link.fetchPriority = priority
  document.head.appendChild(link)
}
```

### 插件优化

```javascript
// 自定义 Vite 插件
function performancePlugin() {
  return {
    name: 'performance-plugin',
    generateBundle(options, bundle) {
      // 分析包大小
      const sizes = Object.entries(bundle).map(([name, chunk]) => ({
        name,
        size: chunk.code?.length || 0
      }))
      
      // 警告大文件
      sizes.forEach(({ name, size }) => {
        if (size > 500 * 1024) { // 500KB
          console.warn(`⚠️  Large chunk detected: ${name} (${(size / 1024).toFixed(2)}KB)`)
        }
      })
    }
  }
}

// 使用插件
export default defineConfig({
  plugins: [
    vue(),
    performancePlugin(),
    
    // 压缩插件
    {
      ...compression({
        algorithm: 'gzip',
        threshold: 1024
      }),
      apply: 'build'
    }
  ]
})
```

## 🌐 运行时优化

### 资源加载优化

```javascript
// 图片懒加载
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { threshold: 0.1 }
    )
  }

  observe(img) {
    this.observer.observe(img)
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src
        
        if (src) {
          // 预加载图片
          const tempImg = new Image()
          tempImg.onload = () => {
            img.src = src
            img.classList.add('loaded')
          }
          tempImg.src = src
        }
        
        this.observer.unobserve(img)
      }
    })
  }
}

// 字体优化
const optimizeFonts = () => {
  // 预加载关键字体
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = '/fonts/main.woff2'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)
  
  // 字体显示策略
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'MainFont';
      src: url('/fonts/main.woff2') format('woff2');
      font-display: swap; /* 快速显示备用字体 */
    }
  `
  document.head.appendChild(style)
}
```

### 缓存策略

```javascript
// Service Worker 缓存
const CACHE_NAME = 'app-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/css/main.css',
  '/js/main.js',
  '/fonts/main.woff2'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response
        }
        
        // 网络请求
        return fetch(event.request)
          .then(response => {
            // 缓存新资源
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone))
            }
            return response
          })
      })
  )
})

// HTTP 缓存策略
const setCacheHeaders = (response, maxAge = 3600) => {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`)
  response.headers.set('ETag', generateETag(response.body))
}
```

### 内存管理

```javascript
// 内存泄漏防护
class MemoryManager {
  constructor() {
    this.timers = new Set()
    this.listeners = new Set()
    this.observers = new Set()
  }

  // 管理定时器
  setTimeout(callback, delay) {
    const timer = setTimeout(() => {
      callback()
      this.timers.delete(timer)
    }, delay)
    this.timers.add(timer)
    return timer
  }

  setInterval(callback, interval) {
    const timer = setInterval(callback, interval)
    this.timers.add(timer)
    return timer
  }

  // 管理事件监听器
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options)
    this.listeners.add({ element, event, handler })
  }

  // 管理观察器
  addObserver(observer) {
    this.observers.add(observer)
  }

  // 清理所有资源
  cleanup() {
    // 清理定时器
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // 清理事件监听器
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    this.listeners.clear()

    // 清理观察器
    this.observers.forEach(observer => {
      if (observer.disconnect) observer.disconnect()
    })
    this.observers.clear()
  }
}

// 在 Vue 组件中使用
export default {
  setup() {
    const memoryManager = new MemoryManager()

    onUnmounted(() => {
      memoryManager.cleanup()
    })

    return { memoryManager }
  }
}
```

## 📈 性能监控

### 实时性能监控

```javascript
// 性能监控服务
class PerformanceService {
  constructor() {
    this.metrics = []
    this.isMonitoring = false
  }

  start() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.observePerformance()
    this.monitorResources()
    this.trackUserInteractions()
  }

  observePerformance() {
    // 监控 Core Web Vitals
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.entryType,
          value: entry.startTime || entry.value,
          timestamp: Date.now()
        })
      }
    }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    // 监控长任务
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now()
          })
        }
      }
    }).observe({ entryTypes: ['longtask'] })
  }

  monitorResources() {
    // 监控资源加载
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: 'resource-timing',
          resource: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          timestamp: Date.now()
        })
      }
    }).observe({ entryTypes: ['resource'] })
  }

  trackUserInteractions() {
    // 监控用户交互
    ['click', 'scroll', 'keypress'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.recordMetric({
          name: 'user-interaction',
          type: eventType,
          timestamp: Date.now()
        })
      }, { passive: true })
    })
  }

  recordMetric(metric) {
    this.metrics.push(metric)
    
    // 批量发送指标
    if (this.metrics.length >= 10) {
      this.sendMetrics()
    }
  }

  sendMetrics() {
    if (this.metrics.length === 0) return

    fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: location.href,
        userAgent: navigator.userAgent,
        metrics: this.metrics,
        timestamp: Date.now()
      })
    }).catch(console.error)

    this.metrics = []
  }
}

// 启动性能监控
const performanceService = new PerformanceService()
performanceService.start()
```

## 📖 性能优化清单

### 开发阶段
- [ ] 使用 Vue3 Composition API
- [ ] 合理使用 computed 和 watch
- [ ] 避免不必要的响应式数据
- [ ] 使用 v-memo 缓存渲染结果
- [ ] 实现组件懒加载

### 构建阶段
- [ ] 配置代码分割
- [ ] 启用 Tree Shaking
- [ ] 压缩 JavaScript 和 CSS
- [ ] 优化图片资源
- [ ] 生成 Service Worker

### 部署阶段
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 配置 CDN 加速
- [ ] 设置合理的缓存策略
- [ ] 使用 HTTP/2
- [ ] 实现资源预加载

### 监控阶段
- [ ] 监控 Core Web Vitals
- [ ] 跟踪用户体验指标
- [ ] 分析性能瓶颈
- [ ] 持续优化改进

---

🎉 **前端性能优化是一个持续的过程。** 通过系统性的优化策略和持续的监控分析，你可以为用户提供更快、更流畅的Web体验。
