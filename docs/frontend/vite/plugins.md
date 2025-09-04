# Vite 插件开发

## 插件体系

Vite 基于 Rollup 构建，其插件 API 与 Rollup 插件兼容，并额外提供了开发服务器相关的钩子。

## 使用现有插件

```bash
npm install @vitejs/plugin-vue -D
```

```ts
import vue from '@vitejs/plugin-vue'
export default { plugins: [vue()] }
```

## 编写自定义插件

一个插件就是一个包含 `name` 和若干钩子的对象：

```ts
// vite.config.ts
import { Plugin } from 'vite'

function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.js')) {
        return code.replace('__BUILD_TIME__', Date.now().toString())
      }
    }
  }
}

export default {
  plugins: [myPlugin()]
}
```

## 虚拟模块示例

```ts
function virtualPlugin() {
  const virtualId = 'virtual:info'
  return {
    name: 'virtual-info',
    resolveId(id) {
      if (id === virtualId) return id
    },
    load(id) {
      if (id === virtualId) {
        return `export default { buildTime: ${Date.now()} }`
      }
    }
  }
}
```

```ts
import info from 'virtual:info'
console.log(info.buildTime)
```

## 参考资料

- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Rollup 插件开发](https://rollupjs.org/guide/en/#plugin-development)
