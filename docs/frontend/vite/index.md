# Vite 开发指南

## 概述

Vite 是下一代前端构建工具，利用原生 ES 模块和高速的 esbuild 进行开发与构建。它具有极快的冷启动速度和丰富的插件生态。

## 初始化项目

```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
npm run dev
```

## 目录结构

```
my-app/
├─ src/
│  ├─ main.ts
│  └─ App.vue
├─ index.html
├─ vite.config.ts
└─ package.json
```

## 配置基础

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

## 环境变量

- `.env`：所有环境共享
- `.env.development`、`.env.production`：特定环境

通过 `import.meta.env` 访问：

```ts
console.log(import.meta.env.VITE_API_URL)
```

## 构建

```bash
npm run build
```

输出在 `dist` 目录，可通过 `npm run preview` 进行本地预览。

## 学习资源

- [Vite 官方文档](https://vitejs.dev/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
