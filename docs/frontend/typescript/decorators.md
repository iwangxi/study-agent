# TypeScript 装饰器

> 装饰器为类和类成员提供元编程能力，目前仍属于实验特性，需在 `tsconfig.json` 中开启。

## 启用配置

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 类装饰器

```ts
function Controller(prefix: string) {
  return function (target: Function) {
    target.prototype.prefix = prefix
  }
}

@Controller('/api')
class UserController {}
```

## 方法装饰器

```ts
function Log(target: any, key: string, desc: PropertyDescriptor) {
  const fn = desc.value
  desc.value = function (...args: any[]) {
    console.log(`call ${key}`)
    return fn.apply(this, args)
  }
}

class Service {
  @Log
  find() {}
}
```

## 属性与参数装饰器

```ts
function MinLength(len: number) {
  return function (target: any, key: string) {
    let val = target[key]
    const getter = () => val
    const setter = (v: string) => {
      if (v.length < len) throw new Error('too short')
      val = v
    }
    Object.defineProperty(target, key, { get: getter, set: setter })
  }
}

class User {
  @MinLength(3)
  name!: string

  greet(@inject('logger') logger: any) {
    logger.info('hello')
  }
}
```

## 注意事项

- 装饰器执行顺序：参数 < 方法 < 访问器 < 属性 < 类
- 需配合 reflect-metadata 获取类型信息
- 在未来标准化前不建议在公共库中大量使用

## 参考资源

- [Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [TypeScript 装饰器](https://www.typescriptlang.org/docs/handbook/decorators.html)
