# Pinia 状态管理

## 🎯 学习目标

通过本章节的学习，你将掌握：
- Pinia 的核心概念和设计理念
- Store 的定义和使用方法
- 状态持久化和模块化管理
- 企业级应用的最佳实践

## 📚 Pinia 简介

Pinia 是 Vue 的官方状态管理库，它是 Vuex 的继任者。Pinia 提供了更简单的 API、更好的 TypeScript 支持，以及更模块化的设计。

### 🌟 核心优势

- **类型安全** - 完整的 TypeScript 支持
- **开发工具** - 出色的开发者体验
- **模块化** - 自然的代码分割
- **轻量级** - 体积小，性能好
- **组合式 API** - 与 Vue 3 完美集成

## 🚀 快速开始

### 安装配置

```bash
# 安装 Pinia
npm install pinia

# 如果需要持久化
npm install pinia-plugin-persistedstate
```

### 基础设置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

## 🏗️ Store 定义

### 基础 Store

```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // 状态 (state)
  const count = ref(0)
  const name = ref('Counter')

  // 计算属性 (getters)
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)

  // 方法 (actions)
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  async function incrementAsync() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    count.value++
  }

  return {
    // 状态
    count,
    name,
    // 计算属性
    doubleCount,
    isEven,
    // 方法
    increment,
    decrement,
    reset,
    incrementAsync
  }
})
```

### Options API 风格

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    userCount: (state) => state.users.length,
    getUserById: (state) => (id: number) => 
      state.users.find(user => user.id === id)
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const response = await authAPI.login(email, password)
        this.currentUser = response.user
        localStorage.setItem('token', response.token)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsers() {
      this.loading = true
      try {
        this.users = await userAPI.getUsers()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.currentUser = null
      localStorage.removeItem('token')
    }
  }
})
```

## 🔧 在组件中使用

### 基础用法

```vue
<template>
  <div>
    <h2>{{ counter.name }}</h2>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <p>Is Even: {{ counter.isEven }}</p>
    
    <button @click="counter.increment">+</button>
    <button @click="counter.decrement">-</button>
    <button @click="counter.reset">Reset</button>
    <button @click="counter.incrementAsync">Async +</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>
```

### 解构使用

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 解构响应式状态和计算属性
const { count, doubleCount } = storeToRefs(counter)

// 解构方法（不需要 storeToRefs）
const { increment, decrement } = counter
</script>
```

## 🔄 状态持久化

### 基础持久化

```typescript
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

```typescript
// stores/settings.ts
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light')
  const language = ref('zh-CN')
  const sidebarCollapsed = ref(false)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setLanguage(lang: string) {
    language.value = lang
  }

  return {
    theme,
    language,
    sidebarCollapsed,
    toggleTheme,
    setLanguage
  }
}, {
  persist: true // 启用持久化
})
```

### 高级持久化配置

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const preferences = ref({})
  const temporaryData = ref({})

  return {
    currentUser,
    preferences,
    temporaryData
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['currentUser', 'preferences'], // 只持久化指定字段
    beforeRestore: (context) => {
      console.log('Before restoring:', context)
    },
    afterRestore: (context) => {
      console.log('After restoring:', context)
    }
  }
})
```

## 🏢 企业级最佳实践

### 模块化组织

```typescript
// stores/modules/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])

  const isAuthenticated = computed(() => !!token.value)
  const hasPermission = computed(() => (permission: string) => 
    permissions.value.includes(permission)
  )

  async function login(credentials: LoginCredentials) {
    try {
      const response = await authAPI.login(credentials)
      token.value = response.token
      user.value = response.user
      permissions.value = response.permissions
      
      // 设置 axios 默认 header
      setAuthToken(response.token)
    } catch (error) {
      throw new AuthError('登录失败')
    }
  }

  function logout() {
    token.value = null
    user.value = null
    permissions.value = []
    removeAuthToken()
  }

  return {
    token,
    user,
    permissions,
    isAuthenticated,
    hasPermission,
    login,
    logout
  }
}, {
  persist: {
    paths: ['token', 'user', 'permissions']
  }
})
```

### 错误处理

```typescript
// stores/modules/error.ts
export const useErrorStore = defineStore('error', () => {
  const errors = ref<AppError[]>([])

  function addError(error: AppError) {
    errors.value.push({
      id: Date.now(),
      ...error,
      timestamp: new Date()
    })
  }

  function removeError(id: number) {
    const index = errors.value.findIndex(error => error.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  function clearErrors() {
    errors.value = []
  }

  // 自动清除过期错误
  function startErrorCleanup() {
    setInterval(() => {
      const now = Date.now()
      errors.value = errors.value.filter(error => 
        now - error.timestamp.getTime() < 30000 // 30秒后自动清除
      )
    }, 5000)
  }

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    startErrorCleanup
  }
})
```

### 加载状态管理

```typescript
// stores/modules/loading.ts
export const useLoadingStore = defineStore('loading', () => {
  const loadingStates = ref<Record<string, boolean>>({})

  function setLoading(key: string, loading: boolean) {
    loadingStates.value[key] = loading
  }

  function isLoading(key: string): boolean {
    return loadingStates.value[key] || false
  }

  const globalLoading = computed(() => 
    Object.values(loadingStates.value).some(loading => loading)
  )

  // 装饰器模式，自动管理加载状态
  function withLoading<T extends (...args: any[]) => Promise<any>>(
    key: string,
    fn: T
  ): T {
    return (async (...args: any[]) => {
      setLoading(key, true)
      try {
        return await fn(...args)
      } finally {
        setLoading(key, false)
      }
    }) as T
  }

  return {
    loadingStates,
    setLoading,
    isLoading,
    globalLoading,
    withLoading
  }
})
```

### 数据缓存策略

```typescript
// stores/modules/cache.ts
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export const useCacheStore = defineStore('cache', () => {
  const cache = ref<Record<string, CacheItem<any>>>({})

  function set<T>(key: string, data: T, ttl: number = 300000) { // 默认5分钟
    cache.value[key] = {
      data,
      timestamp: Date.now(),
      ttl
    }
  }

  function get<T>(key: string): T | null {
    const item = cache.value[key]
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      delete cache.value[key]
      return null
    }

    return item.data
  }

  function has(key: string): boolean {
    return get(key) !== null
  }

  function remove(key: string) {
    delete cache.value[key]
  }

  function clear() {
    cache.value = {}
  }

  // 定期清理过期缓存
  function startCacheCleanup() {
    setInterval(() => {
      const now = Date.now()
      Object.keys(cache.value).forEach(key => {
        const item = cache.value[key]
        if (now - item.timestamp > item.ttl) {
          delete cache.value[key]
        }
      })
    }, 60000) // 每分钟清理一次
  }

  return {
    set,
    get,
    has,
    remove,
    clear,
    startCacheCleanup
  }
})
```

## 🧪 测试

### Store 单元测试

```typescript
// tests/stores/counter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('increments count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    
    counter.increment()
    expect(counter.count).toBe(1)
  })

  it('computes double count correctly', () => {
    const counter = useCounterStore()
    counter.count = 5
    expect(counter.doubleCount).toBe(10)
  })

  it('resets count to zero', () => {
    const counter = useCounterStore()
    counter.count = 10
    counter.reset()
    expect(counter.count).toBe(0)
  })
})
```

### 组件测试

```typescript
// tests/components/Counter.test.ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Counter from '@/components/Counter.vue'

describe('Counter Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays count correctly', () => {
    const wrapper = mount(Counter)
    expect(wrapper.text()).toContain('Count: 0')
  })

  it('increments count when button clicked', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('[data-test="increment"]').trigger('click')
    expect(wrapper.text()).toContain('Count: 1')
  })
})
```

## 📖 学习资源

### 官方资源
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Pinia GitHub](https://github.com/vuejs/pinia)

### 实战教程
- [Vue3 + Pinia 实战项目](https://github.com/vuejs/pinia/tree/v2/packages/playground)
- [企业级状态管理最佳实践](https://pinia.vuejs.org/cookbook/)

---

🎉 **恭喜！** 你已经掌握了Pinia状态管理的核心用法。接下来可以学习 [Vue Router 路由管理](/frontend/vue3/router) 或开始 [实战项目](/projects/)。
