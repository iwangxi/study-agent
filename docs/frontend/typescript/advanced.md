# TypeScript 进阶语法

## 条件类型

```ts
type IsString<T> = T extends string ? true : false
```

## 映射类型

```ts
interface User {
  id: number
  name: string
}

type PartialUser = { [K in keyof User]?: User[K] }
```

## 模板字面量类型

```ts
type EventName<T extends string> = `on${Capitalize<T>}`
```

## 泛型约束与默认值

```ts
function merge<T extends object, U extends object = {}>(a: T, b: U): T & U {
  return { ...a, ...b }
}
```

## Utility Types

- `Partial<T>`：将所有属性设为可选
- `Pick<T, K>`：从类型中选取属性
- `Record<K, T>`：创建键值映射

## 类型守卫

```ts
function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}
```

## 模式匹配

```ts
type ExtractPromise<T> = T extends Promise<infer R> ? R : T
```

## 学习资源

- [Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
