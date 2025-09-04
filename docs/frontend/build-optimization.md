# 构建优化策略

## Tree Shaking

删除未使用的代码以减小 bundle 体积。确保使用 ES Module 并开启 `sideEffects` 配置。

```json
// package.json
{
  "sideEffects": false
}
```

## 代码分割

使用动态导入按需加载模块：

```js
import('lodash').then(_ => {
  // 使用 lodash
})
```

在路由层面可以结合懒加载实现页面级分割。

## 缓存与哈希

构建时输出带内容哈希的文件名，并合理设置 HTTP 缓存头：

```js
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
}
```

## 资源压缩

- 压缩 JavaScript/CSS（Terser、esbuild）
- 使用 `imagemin` 等工具优化图片
- 启用 Gzip/Brotli 服务器压缩

## Bundle 分析

通过分析工具发现体积瓶颈：

```bash
npm install -D rollup-plugin-visualizer
```

```js
// vite.config.ts
import visualizer from 'rollup-plugin-visualizer'
export default {
  plugins: [visualizer({ open: true })]
}
```

## CI/CD 中的优化

- 按需构建不同环境产物
- 使用缓存加速依赖安装
- 在构建完成后运行性能基准测试

## 参考资源

- [Vite build options](https://vitejs.dev/config/build-options.html)
- [Webpack 优化指南](https://webpack.js.org/guides/code-splitting/)
