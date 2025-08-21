# Vue3 核心技术

## 🎯 学习目标

通过本章节的学习，你将掌握：
- Vue3 的核心概念和设计理念
- Composition API 的使用方法
- 响应式系统的工作原理
- 组件开发的最佳实践

## 📚 Vue3 简介

Vue3 是一个用于构建用户界面的渐进式JavaScript框架。相比Vue2，Vue3在性能、类型支持、组合式API等方面都有显著提升。

### 🆕 Vue3 的主要特性

- **更好的性能** - 更小的包体积，更快的渲染速度
- **更好的TypeScript支持** - 原生TypeScript支持
- **Composition API** - 更灵活的逻辑组合方式
- **多根节点** - 组件可以有多个根节点
- **更好的Tree-shaking** - 按需引入，减少包体积

## 🚀 快速开始

### 环境准备

```bash
# 检查Node.js版本 (需要16+)
node --version

# 安装Vue CLI或使用Vite
npm create vue@latest my-vue-app
# 或
npm install -g @vue/cli
vue create my-vue-app
```

### 第一个Vue3应用

```vue
<template>
  <div id="app">
    <h1>{{ message }}</h1>
    <button @click="increment">点击次数: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const message = ref('Hello Vue3!')
const count = ref(0)

// 方法
const increment = () => {
  count.value++
}
</script>

<style scoped>
#app {
  text-align: center;
  margin-top: 60px;
}
</style>
```

## 🔧 Composition API

### setup() 函数

```javascript
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  setup() {
    // 响应式数据
    const count = ref(0)
    const user = reactive({
      name: 'John',
      age: 25
    })

    // 计算属性
    const doubleCount = computed(() => count.value * 2)

    // 方法
    const increment = () => {
      count.value++
    }

    // 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 返回给模板使用
    return {
      count,
      user,
      doubleCount,
      increment
    }
  }
}
```

### script setup 语法糖

```vue
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 直接声明，无需return
const count = ref(0)
const user = reactive({
  name: 'John',
  age: 25
})

const doubleCount = computed(() => count.value * 2)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

## 📊 响应式系统

### ref vs reactive

```javascript
import { ref, reactive } from 'vue'

// ref - 用于基本类型
const count = ref(0)
const message = ref('Hello')

// 访问值需要 .value
console.log(count.value) // 0
count.value = 1

// reactive - 用于对象类型
const state = reactive({
  count: 0,
  message: 'Hello'
})

// 直接访问属性
console.log(state.count) // 0
state.count = 1
```

### 计算属性

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

### 侦听器

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 侦听单个数据源
watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
})

// 侦听多个数据源
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log('count或message发生了变化')
})

// 立即执行的侦听器
watchEffect(() => {
  console.log(`count的值是: ${count.value}`)
})
```

## 🧩 组件开发

### 组件通信

#### Props

```vue
<!-- 子组件 -->
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
  </div>
</template>

<script setup>
// 定义props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: '默认内容'
  }
})

// 或者使用TypeScript
interface Props {
  title: string
  content?: string
}
const props = defineProps<Props>()
</script>
```

#### Emits

```vue
<!-- 子组件 -->
<template>
  <button @click="handleClick">点击我</button>
</template>

<script setup>
// 定义事件
const emit = defineEmits(['update', 'delete'])

// 或者使用TypeScript
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

const handleClick = () => {
  emit('update', 'new value')
}
</script>
```

#### 插槽 (Slots)

```vue
<!-- 父组件 -->
<template>
  <Card>
    <template #header>
      <h1>标题</h1>
    </template>
    
    <template #default>
      <p>内容</p>
    </template>
    
    <template #footer>
      <button>确定</button>
    </template>
  </Card>
</template>

<!-- Card组件 -->
<template>
  <div class="card">
    <header>
      <slot name="header"></slot>
    </header>
    
    <main>
      <slot></slot>
    </main>
    
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

## 🔄 生命周期

```javascript
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('组件挂载前')
    })

    onMounted(() => {
      console.log('组件已挂载')
    })

    onBeforeUpdate(() => {
      console.log('组件更新前')
    })

    onUpdated(() => {
      console.log('组件已更新')
    })

    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })

    onUnmounted(() => {
      console.log('组件已卸载')
    })
  }
}
```

## 🎨 模板语法

### 指令

```vue
<template>
  <!-- 文本插值 -->
  <p>{{ message }}</p>
  
  <!-- 原始HTML -->
  <div v-html="rawHtml"></div>
  
  <!-- 属性绑定 -->
  <img :src="imageSrc" :alt="imageAlt">
  
  <!-- 条件渲染 -->
  <p v-if="seen">现在你看到我了</p>
  <p v-else>看不到我</p>
  
  <!-- 列表渲染 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
  
  <!-- 事件监听 -->
  <button @click="handleClick">点击</button>
  <input @keyup.enter="handleEnter">
  
  <!-- 双向绑定 -->
  <input v-model="inputValue">
</template>
```

## 📖 学习资源

### 官方资源
- [Vue3 官方文档](https://vuejs.org/)
- [Vue3 中文文档](https://cn.vuejs.org/)
- [Vue3 迁移指南](https://v3-migration.vuejs.org/)

### 视频教程
- [Vue3 从入门到实战](https://www.bilibili.com/video/BV1dS4y1y7vd)
- [Vue3 + TypeScript 实战](https://www.bilibili.com/video/BV1Zy4y1K7SH)

### 实战项目
- [Vue3 管理后台](https://github.com/PanJiaChen/vue-element-admin)
- [Vue3 移动端项目](https://github.com/newbee-ltd/vue3-admin)

## 🛠️ 开发工具

### VS Code 插件推荐
- **Vetur** - Vue语法高亮
- **Vue Language Features (Volar)** - Vue3官方插件
- **TypeScript Vue Plugin (Volar)** - TypeScript支持

### 浏览器插件
- **Vue.js devtools** - Vue开发者工具

## 🎯 实践练习

### 练习1：计数器应用
创建一个简单的计数器，包含增加、减少、重置功能。

### 练习2：待办事项列表
实现一个待办事项管理应用，包含添加、删除、标记完成功能。

### 练习3：用户信息表单
创建一个用户信息表单，包含表单验证和数据提交功能。

---

🎉 **恭喜！** 你已经掌握了Vue3的核心概念。接下来可以学习 [Composition API 进阶](/frontend/vue3/composition-api) 或 [Vue Router](/frontend/vue3/router)。
