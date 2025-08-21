# 🎯 全栈开发面试指南

## 📋 面试准备概览

本指南专为 **NestJS + Vue3 + TypeORM** 技术栈的全栈开发者准备，涵盖从初级到高级的面试题目和答题技巧。

### 🎯 面试准备策略

1. **技术基础** - 扎实的前后端基础知识
2. **项目经验** - 完整的项目开发经历
3. **问题解决** - 分析和解决问题的能力
4. **沟通表达** - 清晰的技术表达能力
5. **学习能力** - 持续学习和适应新技术

## 📊 面试难度分级

- 🟢 **初级 (1-2年经验)** - 基础概念和简单应用
- 🟡 **中级 (2-4年经验)** - 深入理解和实际应用
- 🔴 **高级 (4年以上经验)** - 架构设计和性能优化

## 🎨 前端面试题 (Vue3)

### 🟢 基础题目

#### 1. Vue3 相比 Vue2 有哪些主要改进？

**答题要点：**
- **Composition API** - 更好的逻辑复用和组织
- **性能提升** - 更小的包体积，更快的渲染
- **TypeScript 支持** - 原生 TypeScript 支持
- **多根节点** - Fragment 支持
- **更好的 Tree-shaking** - 按需引入

**示例代码：**
```javascript
// Vue2 Options API
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
}

// Vue3 Composition API
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
}
```

#### 2. 解释 ref 和 reactive 的区别

**答题要点：**
- **ref** - 用于基本类型，需要 .value 访问
- **reactive** - 用于对象类型，直接访问属性
- **响应式原理** - Proxy 代理实现

**示例代码：**
```javascript
import { ref, reactive } from 'vue'

// ref 用法
const count = ref(0)
console.log(count.value) // 需要 .value

// reactive 用法
const state = reactive({
  count: 0,
  name: 'Vue3'
})
console.log(state.count) // 直接访问
```

#### 3. 什么是 Composition API？有什么优势？

**答题要点：**
- **逻辑复用** - 更好的代码组织和复用
- **类型推导** - 更好的 TypeScript 支持
- **性能优化** - 更精确的依赖追踪
- **代码组织** - 按功能而非选项组织代码

### 🟡 中级题目

#### 4. 如何在 Vue3 中实现组件通信？

**答题要点：**
- **Props/Emit** - 父子组件通信
- **Provide/Inject** - 跨层级组件通信
- **Pinia** - 全局状态管理
- **Event Bus** - 兄弟组件通信

**示例代码：**
```javascript
// 父子组件通信
// 父组件
<ChildComponent :data="parentData" @update="handleUpdate" />

// 子组件
const emit = defineEmits(['update'])
const props = defineProps(['data'])

// Provide/Inject
// 祖先组件
provide('theme', 'dark')

// 后代组件
const theme = inject('theme')
```

#### 5. 解释 Vue3 的响应式原理

**答题要点：**
- **Proxy 代理** - 替代 Vue2 的 Object.defineProperty
- **依赖收集** - track 函数收集依赖
- **触发更新** - trigger 函数触发更新
- **性能优化** - 更精确的更新机制

### 🔴 高级题目

#### 6. 如何优化 Vue3 应用的性能？

**答题要点：**
- **代码分割** - 路由懒加载和组件懒加载
- **虚拟滚动** - 处理大量数据
- **缓存策略** - keep-alive 和 HTTP 缓存
- **打包优化** - Tree-shaking 和压缩

**示例代码：**
```javascript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]

// 组件懒加载
const AsyncComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
```

## ⚙️ 后端面试题 (NestJS)

### 🟢 基础题目

#### 1. 什么是 NestJS？它有什么特点？

**答题要点：**
- **企业级框架** - 基于 Node.js 的可扩展框架
- **装饰器模式** - 使用装饰器进行声明式编程
- **依赖注入** - 强大的 IoC 容器
- **模块化** - 清晰的模块组织结构
- **TypeScript 优先** - 原生 TypeScript 支持

#### 2. 解释 NestJS 中的依赖注入

**答题要点：**
- **IoC 容器** - 控制反转容器管理依赖
- **Provider** - 服务提供者
- **Injectable 装饰器** - 标记可注入的类
- **构造函数注入** - 通过构造函数注入依赖

**示例代码：**
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
}
```

#### 3. NestJS 中的模块系统是如何工作的？

**答题要点：**
- **@Module 装饰器** - 定义模块
- **imports** - 导入其他模块
- **providers** - 模块内的服务提供者
- **controllers** - 模块内的控制器
- **exports** - 导出给其他模块使用

### 🟡 中级题目

#### 4. 如何在 NestJS 中实现身份认证和授权？

**答题要点：**
- **JWT 策略** - JSON Web Token 认证
- **Guards** - 路由守卫
- **Passport 集成** - 认证策略
- **角色权限** - 基于角色的访问控制

**示例代码：**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.some(role => user.roles?.includes(role));
  }
}
```

#### 5. 解释 NestJS 中的中间件、拦截器和管道的区别

**答题要点：**
- **中间件 (Middleware)** - 请求处理前执行
- **拦截器 (Interceptor)** - 方法执行前后处理
- **管道 (Pipe)** - 数据转换和验证
- **执行顺序** - 中间件 → 守卫 → 拦截器 → 管道 → 控制器

### 🔴 高级题目

#### 6. 如何设计 NestJS 微服务架构？

**答题要点：**
- **服务拆分** - 按业务领域拆分服务
- **通信方式** - TCP、Redis、RabbitMQ 等
- **服务发现** - 服务注册和发现机制
- **数据一致性** - 事件驱动和 Saga 模式

## 💾 数据库面试题 (TypeORM)

### 🟢 基础题目

#### 1. 什么是 ORM？TypeORM 有什么优势？

**答题要点：**
- **对象关系映射** - 将数据库表映射为对象
- **类型安全** - TypeScript 类型检查
- **跨数据库** - 支持多种数据库
- **迁移系统** - 自动生成和执行迁移

#### 2. 如何在 TypeORM 中定义实体关系？

**示例代码：**
```typescript
// 一对多关系
@Entity()
export class User {
  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

@Entity()
export class Post {
  @ManyToOne(() => User, user => user.posts)
  author: User;
}

// 多对多关系
@Entity()
export class Post {
  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable()
  tags: Tag[];
}
```

### 🟡 中级题目

#### 3. 如何优化 TypeORM 查询性能？

**答题要点：**
- **预加载关系** - eager loading vs lazy loading
- **查询构建器** - 复杂查询优化
- **索引使用** - 数据库索引优化
- **批量操作** - 减少数据库往返

**示例代码：**
```typescript
// 预加载关系
const users = await userRepository.find({
  relations: ['posts', 'profile']
});

// 查询构建器
const posts = await postRepository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')
  .where('post.published = :published', { published: true })
  .orderBy('post.createdAt', 'DESC')
  .getMany();
```

## 🏗️ 系统设计题目

### 🔴 高级题目

#### 1. 设计一个高并发的博客系统

**答题要点：**
- **架构设计** - 微服务 vs 单体应用
- **数据库设计** - 读写分离、分库分表
- **缓存策略** - Redis 缓存层
- **CDN 加速** - 静态资源分发
- **负载均衡** - 请求分发策略

#### 2. 如何处理系统的高可用性？

**答题要点：**
- **容错设计** - 熔断器、重试机制
- **监控告警** - 实时监控和告警
- **备份恢复** - 数据备份和灾难恢复
- **灰度发布** - 渐进式部署策略

## 💼 项目经验题目

### 常见问题

#### 1. 介绍一个你最满意的项目

**答题结构：**
- **项目背景** - 业务需求和技术挑战
- **技术选型** - 为什么选择这些技术
- **架构设计** - 系统架构和模块划分
- **难点解决** - 遇到的问题和解决方案
- **项目成果** - 最终效果和收获

#### 2. 你在项目中遇到的最大挑战是什么？

**答题要点：**
- **具体问题** - 详细描述遇到的问题
- **分析过程** - 如何分析和定位问题
- **解决方案** - 采用的解决方法
- **经验总结** - 从中学到的经验教训

## 📚 面试准备建议

### 技术准备

1. **基础知识** - 扎实掌握核心概念
2. **实战项目** - 完成至少 2-3 个完整项目
3. **源码阅读** - 了解框架底层实现
4. **性能优化** - 掌握常见优化技巧

### 软技能准备

1. **沟通表达** - 清晰表达技术观点
2. **问题解决** - 结构化思考问题
3. **学习能力** - 展示持续学习的态度
4. **团队协作** - 分享团队合作经验

### 面试技巧

1. **STAR 法则** - 情境、任务、行动、结果
2. **代码演示** - 准备常见算法和代码片段
3. **提问环节** - 准备有质量的问题
4. **心态调整** - 保持自信和积极态度

## 🎯 面试复习清单

### 前端技术栈
- [ ] Vue3 Composition API
- [ ] TypeScript 高级类型
- [ ] Vite 构建工具
- [ ] Pinia 状态管理
- [ ] Vue Router 路由
- [ ] 性能优化技巧

### 后端技术栈
- [ ] NestJS 核心概念
- [ ] TypeORM 数据库操作
- [ ] JWT 身份认证
- [ ] 微服务架构
- [ ] API 设计规范
- [ ] 错误处理机制

### 工程化技能
- [ ] Git 版本控制
- [ ] Docker 容器化
- [ ] CI/CD 流程
- [ ] 测试策略
- [ ] 代码规范
- [ ] 性能监控

### 软技能
- [ ] 项目管理经验
- [ ] 团队协作能力
- [ ] 沟通表达技巧
- [ ] 问题解决思路
- [ ] 学习成长规划

---

🎯 **面试成功的关键在于充分准备和实际经验的积累。** 通过系统性的学习和实践，相信你能在面试中展现出色的技术能力和职业素养！

**最后建议：**
- 多做实际项目，积累真实经验
- 关注技术发展趋势，保持学习热情
- 培养解决问题的思维方式
- 提升沟通表达和团队协作能力
