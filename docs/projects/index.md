# 🚀 实战项目

## 项目概述

通过实际项目来巩固所学的 NestJS + Vue3 + TypeORM 技术栈知识。每个项目都包含完整的前后端代码、详细的开发文档和部署指南。

## 📊 项目难度分级

- 🟢 **初级项目** - 适合刚入门的开发者
- 🟡 **中级项目** - 需要一定的开发经验
- 🔴 **高级项目** - 适合有经验的开发者

## 🎯 项目列表

### 🟢 初级项目

#### 1. 个人博客系统
**技术栈：** Vue3 + NestJS + TypeORM + PostgreSQL

**功能特性：**
- 文章发布与管理
- 分类和标签系统
- 评论功能
- 用户注册登录
- 响应式设计

**学习目标：**
- 掌握基本的CRUD操作
- 理解前后端分离架构
- 学习用户认证与授权
- 熟悉数据库设计

**项目地址：** [GitHub](https://github.com/example/blog-system)
**在线演示：** [Demo](https://blog-demo.example.com)

---

#### 2. 待办事项管理
**技术栈：** Vue3 + NestJS + TypeORM + MySQL

**功能特性：**
- 任务创建、编辑、删除
- 任务状态管理
- 优先级设置
- 截止日期提醒
- 数据统计

**学习目标：**
- 掌握状态管理
- 学习日期处理
- 理解数据可视化
- 熟悉组件通信

**项目地址：** [GitHub](https://github.com/example/todo-app)
**在线演示：** [Demo](https://todo-demo.example.com)

---

### 🟡 中级项目

#### 3. 电商管理后台
**技术栈：** Vue3 + NestJS + TypeORM + PostgreSQL + Redis

**功能特性：**
- 商品管理系统
- 订单处理流程
- 用户权限管理
- 数据统计分析
- 文件上传处理

**学习目标：**
- 掌握复杂业务逻辑
- 学习权限控制
- 理解缓存机制
- 熟悉文件处理

**项目地址：** [GitHub](https://github.com/example/ecommerce-admin)
**在线演示：** [Demo](https://admin-demo.example.com)

---

#### 4. 在线教育平台
**技术栈：** Vue3 + NestJS + TypeORM + PostgreSQL + WebSocket

**功能特性：**
- 课程管理系统
- 在线视频播放
- 实时聊天功能
- 作业提交系统
- 学习进度跟踪

**学习目标：**
- 掌握实时通信
- 学习视频处理
- 理解复杂状态管理
- 熟悉第三方集成

**项目地址：** [GitHub](https://github.com/example/education-platform)
**在线演示：** [Demo](https://edu-demo.example.com)

---

### 🔴 高级项目

#### 5. 企业级CRM系统
**技术栈：** Vue3 + NestJS + TypeORM + PostgreSQL + Redis + Docker

**功能特性：**
- 客户关系管理
- 销售流程自动化
- 报表分析系统
- 多租户架构
- 微服务设计

**学习目标：**
- 掌握微服务架构
- 学习多租户设计
- 理解企业级开发
- 熟悉容器化部署

**项目地址：** [GitHub](https://github.com/example/crm-system)
**在线演示：** [Demo](https://crm-demo.example.com)

---

#### 6. 实时协作平台
**技术栈：** Vue3 + NestJS + TypeORM + PostgreSQL + WebSocket + GraphQL

**功能特性：**
- 实时文档编辑
- 团队协作功能
- 版本控制系统
- 权限精细化管理
- 插件系统

**学习目标：**
- 掌握实时协作技术
- 学习GraphQL应用
- 理解插件架构
- 熟悉版本控制

**项目地址：** [GitHub](https://github.com/example/collaboration-platform)
**在线演示：** [Demo](https://collab-demo.example.com)

---

## 🛠️ 开发环境搭建

### 基础环境要求

```bash
# Node.js 版本要求
node --version  # >= 18.0.0

# 包管理器
npm --version   # >= 8.0.0
# 或
pnpm --version  # >= 7.0.0

# 数据库
postgresql --version  # >= 13.0
# 或
mysql --version      # >= 8.0

# 缓存
redis-server --version  # >= 6.0
```

### 项目初始化模板

```bash
# 克隆项目模板
git clone https://github.com/example/nestjs-vue3-template.git my-project

# 进入项目目录
cd my-project

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动数据库
docker-compose up -d postgres redis

# 运行数据库迁移
pnpm run migration:run

# 启动开发服务器
pnpm run dev
```

## 📚 项目开发指南

### 1. 项目结构规范

```
project/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/          # 页面组件
│   │   ├── stores/         # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── types/          # 类型定义
│   └── package.json
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   ├── common/         # 公共模块
│   │   ├── config/         # 配置文件
│   │   └── database/       # 数据库相关
│   └── package.json
├── shared/                  # 共享代码
│   ├── types/              # 共享类型
│   └── utils/              # 共享工具
├── docs/                   # 项目文档
└── docker-compose.yml      # Docker配置
```

### 2. 开发流程

#### 第一阶段：需求分析与设计
- 分析项目需求
- 设计数据库模型
- 制定API接口规范
- 设计前端页面原型

#### 第二阶段：后端开发
- 创建数据库实体
- 实现业务逻辑
- 编写API接口
- 添加单元测试

#### 第三阶段：前端开发
- 创建页面组件
- 实现状态管理
- 对接后端API
- 优化用户体验

#### 第四阶段：集成测试
- 前后端联调
- 集成测试
- 性能优化
- 部署上线

### 3. 代码规范

#### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### ESLint 配置

```json
{
  "extends": [
    "@vue/typescript/recommended",
    "@nestjs/eslint-config-nestjs"
  ],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

## 🧪 测试策略

### 单元测试

```typescript
// 后端服务测试
describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// 前端组件测试
describe('CatList.vue', () => {
  it('renders cat list correctly', () => {
    const wrapper = mount(CatList, {
      props: { cats: mockCats }
    });
    
    expect(wrapper.findAll('.cat-item')).toHaveLength(mockCats.length);
  });
});
```

### 集成测试

```typescript
describe('Cats API', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/cats (GET)', () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});
```

## 🚀 部署指南

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### GitHub Actions CI/CD

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to production
      run: npm run deploy
```

## 📈 学习路径建议

### 初学者路径
1. 从**个人博客系统**开始
2. 完成**待办事项管理**
3. 尝试**电商管理后台**

### 进阶路径
1. 深入**在线教育平台**
2. 挑战**企业级CRM系统**
3. 探索**实时协作平台**

### 学习建议
- 每个项目都要完整实现
- 注重代码质量和规范
- 多写测试用例
- 关注性能优化
- 学习部署运维

---

🎯 **选择一个适合你水平的项目开始实战吧！** 记住，实践是最好的学习方式。
