# TypeScript 基础

## 为什么使用 TypeScript

- 静态类型提升可维护性
- 更好的 IDE 支持和自动补全
- 早期发现潜在错误

## 基本类型

```ts
let isDone: boolean = false
let age: number = 18
let name: string = 'Tom'
let list: number[] = [1, 2, 3]
```

## 接口与类型别名

```ts
interface User {
  id: number
  name: string
}

type Point = { x: number; y: number }
```

## 泛型

```ts
function identity<T>(arg: T): T {
  return arg
}
```

## tsconfig

```bash
npx tsc --init
```

常用配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "node"
  }
}
```

## 编译

```bash
npx tsc # 编译整个项目
npx tsc file.ts --watch
```

## 学习资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 手册中文版](https://ts.xcatliu.com/)
