# 运行时性能优化

## 渲染优化

- 合理拆分组件，减少不必要的重渲染
- 使用 `v-memo`、`v-once` 或 React 的 `memo` 缓存结果
- 列表渲染中添加 `key` 提升 diff 性能

## 虚拟列表

对于大量数据的渲染，可采用虚拟滚动技术，仅渲染可视区域元素：

```vue
<virtual-list :data="items" :size="40" />
```

常用库：`vue-virtual-scroller`、`react-window`。

## 事件节流与防抖

```ts
function throttle(fn, wait) {
  let timer = null
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, wait)
    }
  }
}
```

## Web Worker

将计算密集型任务放入 Worker，避免阻塞主线程：

```js
// worker.js
self.onmessage = e => {
  const result = heavyCalc(e.data)
  postMessage(result)
}
```

## 性能监控

- 使用浏览器 Performance 工具分析瓶颈
- 借助 `web-vitals` 收集用户端性能数据
- 在 CI 中加入 Lighthouse 分析

## 参考资源

- [Vue 性能优化](https://vuejs.org/guide/best-practices/performance.html)
- [React 优化指南](https://react.dev/learn/escaping-the-javascript-heavy-site)
