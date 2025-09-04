# Composition API 详解

## 概述

Composition API 是 Vue 3 引入的一套全新的逻辑组织方式，相比 Options API 能够更好地复用逻辑并提升 TypeScript 支持。所有组合式 API 都在 `setup()` 函数中使用。

## 基础语法

```vue
<script setup>
import { ref, reactive, computed, watch } from 'vue'

const count = ref(0)
const state = reactive({ msg: 'hello' })
const double = computed(() => count.value * 2)

watch(() => state.msg, (v) => {
  console.log('message changed:', v)
})
</script>

<template>
  <p>{{ state.msg }}: {{ double }}</p>
  <button @click="count++">+</button>
</template>
```

## 生命周期

组合式 API 使用以 `on` 开头的函数注册生命周期钩子：

```js
import { onMounted, onUnmounted } from 'vue'

onMounted(() => console.log('mounted'))
onUnmounted(() => console.log('unmounted'))
```

## 自定义组合函数

组合函数可以抽离和复用状态逻辑：

```js
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<script setup>
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>X: {{ x }}, Y: {{ y }}</p>
</template>
```

## 与 Options API 对比

- 更易于逻辑复用
- 更好的类型推断
- 更灵活的代码组织

## 学习资源

- [官方文档](https://vuejs.org/guide/reusability/composables.html)
- [Vue Composition API RFC](https://github.com/vuejs/rfcs/blob/main/active-rfcs/0015-composition-api.md)
