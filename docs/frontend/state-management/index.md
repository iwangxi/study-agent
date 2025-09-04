# 前端状态管理概述

## 状态类别

前端应用中的状态大致可分为：

1. **本地 UI 状态**：组件内部的交互状态，如表单输入。
2. **全局共享状态**：跨组件需要共享的数据，如用户信息。
3. **服务器状态**：通过接口获取并需要与服务器同步的数据。
4. **URL 状态**：来自路由、查询参数等影响页面的状态。

了解状态的分类有助于选择合适的管理方式。

## 常见方案

### 1. 原生组合
- 组件 `props` / `emits`
- `provide` / `inject`
- 事件总线（Event Bus）

### 2. 专用库
- **Pinia**：Vue3 官方推荐的轻量级状态库
- **Redux / Zustand**：React 生态常用方案
- **MobX**：响应式状态管理库

```ts
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ name: '', loggedIn: false }),
  actions: {
    login(name: string) {
      this.name = name
      this.loggedIn = true
    }
  }
})
```

```vue
<script setup>
import { useUserStore } from '@/stores/user'
const user = useUserStore()
</script>

<template>
  <div v-if="user.loggedIn">Hello {{ user.name }}</div>
</template>
```

## 选择建议

- 状态简单时优先使用组合式 API 或组件通信
- 多页面共享的复杂状态可使用 Pinia/Redux 等库
- 服务器状态可结合 SWR、RTK Query 等数据获取库

## 最佳实践

1. 保持状态扁平化，避免深层嵌套
2. 按模块拆分 store，利于维护
3. 利用 TypeScript 获取更好自动完成和类型安全
4. 对于异步状态，区分 loading / error / data 三种状态

## 学习资源

- [Pinia 文档](https://pinia.vuejs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [State Management Patterns](https://vuejs.org/guide/scaling-up/state-management.html)
