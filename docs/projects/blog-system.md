# 🚀 实战项目：个人博客系统

## 📋 项目概述

本项目是一个基于 **NestJS + Vue3 + TypeORM** 技术栈的全栈博客系统，包含完整的前后端功能，适合初学者学习全栈开发的核心概念。

### 🎯 项目特色

- **现代化技术栈** - Vue3 + NestJS + TypeORM + PostgreSQL
- **完整功能模块** - 用户管理、文章发布、评论系统、标签分类
- **响应式设计** - 支持移动端和桌面端
- **权限控制** - 基于 JWT 的身份认证和授权
- **SEO 优化** - 服务端渲染和元数据管理

## 🛠️ 技术栈

### 前端技术
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 的状态管理库
- **Vue Router** - 官方路由管理器
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP 客户端

### 后端技术
- **NestJS** - 企业级 Node.js 框架
- **TypeORM** - TypeScript ORM 框架
- **PostgreSQL** - 关系型数据库
- **JWT** - JSON Web Token 认证
- **Swagger** - API 文档生成
- **Multer** - 文件上传处理

## 📊 功能模块

### 用户模块
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 头像上传
- ✅ 密码修改
- ✅ 邮箱验证

### 文章模块
- ✅ 文章发布/编辑
- ✅ Markdown 编辑器
- ✅ 文章分类管理
- ✅ 标签系统
- ✅ 文章搜索
- ✅ 阅读统计

### 评论模块
- ✅ 评论发布
- ✅ 评论回复
- ✅ 评论点赞
- ✅ 评论管理

### 管理模块
- ✅ 后台管理界面
- ✅ 用户管理
- ✅ 文章审核
- ✅ 数据统计

## 🏗️ 项目架构

### 目录结构

```
blog-system/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/          # 页面组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   ├── types/          # TypeScript 类型
│   │   └── assets/         # 静态资源
│   ├── public/             # 公共文件
│   └── package.json
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── users/      # 用户模块
│   │   │   ├── posts/      # 文章模块
│   │   │   └── comments/   # 评论模块
│   │   ├── common/         # 公共模块
│   │   ├── config/         # 配置文件
│   │   └── database/       # 数据库相关
│   └── package.json
├── shared/                  # 共享代码
│   ├── types/              # 共享类型定义
│   └── utils/              # 共享工具函数
└── docker-compose.yml      # Docker 编排文件
```

## 🚀 快速开始

### 环境准备

```bash
# 检查 Node.js 版本 (需要 18+)
node --version

# 检查 npm 版本
npm --version

# 安装 PostgreSQL (或使用 Docker)
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql
```

### 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-username/blog-system.git
cd blog-system

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 数据库配置

```bash
# 创建数据库
createdb blog_system

# 配置环境变量
cp .env.example .env
```

```env
# .env 文件配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=blog_system

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 启动项目

```bash
# 启动后端服务
cd backend
npm run start:dev

# 启动前端服务
cd frontend
npm run dev
```

## 💾 数据库设计

### 用户表 (users)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 文章表 (posts)

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  author_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);
```

### 分类表 (categories)

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#007bff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 标签表 (tags)

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6c757d',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 文章标签关联表 (post_tags)

```sql
CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### 评论表 (comments)

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id),
  like_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 后端实现

### 用户实体定义

```typescript
// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 文章实体定义

```typescript
// src/modules/posts/entities/post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ unique: true, length: 200 })
  slug: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @ManyToOne(() => Category, category => category.posts)
  category: Category;

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable({ name: 'post_tags' })
  tags: Tag[];

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;
}
```

### 认证服务

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // 检查用户是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // 生成 JWT
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    };
  }

  async validateUser(userId: number) {
    return await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'avatar', 'role'],
    });
  }
}
```

### 文章服务

```typescript
// src/modules/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: number) {
    const post = this.postRepository.create({
      ...createPostDto,
      author: { id: authorId },
    });

    return await this.postRepository.save(post);
  }

  async findAll(queryDto: QueryPostDto) {
    const { page = 1, limit = 10, category, tag, status = 'published' } = queryDto;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.status = :status', { status });

    if (category) {
      queryBuilder.andWhere('category.slug = :category', { category });
    }

    if (tag) {
      queryBuilder.andWhere('tags.slug = :tag', { tag });
    }

    const [posts, total] = await queryBuilder
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    // 增加阅读量
    await this.postRepository.increment({ id }, 'viewCount', 1);

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    
    Object.assign(post, updatePostDto);
    
    return await this.postRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    return await this.postRepository.remove(post);
  }
}
```

## 🎨 前端实现

### 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('@/views/Posts.vue'),
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('@/views/PostDetail.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/');
  } else {
    next();
  }
});

export default router;
```

### 状态管理

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function register(userData) {
    try {
      const response = await authAPI.register(userData);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function fetchUser() {
    if (!token.value) return;

    try {
      const response = await authAPI.getProfile();
      user.value = response;
    } catch (error) {
      logout();
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  };
}, {
  persist: {
    paths: ['token'],
  },
});
```

## 📖 学习收获

通过完成这个博客系统项目，你将掌握：

1. **全栈开发流程** - 从需求分析到部署上线
2. **数据库设计** - 关系型数据库的设计原则
3. **API 设计** - RESTful API 的设计和实现
4. **身份认证** - JWT 认证机制的实现
5. **状态管理** - 前端状态管理的最佳实践
6. **组件化开发** - Vue3 组件的设计和复用
7. **类型安全** - TypeScript 在全栈开发中的应用

## 🚀 部署指南

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境部署

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build

# 启动生产服务
npm run start:prod
```

---

🎉 **恭喜！** 你已经完成了一个完整的全栈博客系统。这个项目涵盖了现代 Web 开发的核心技术和最佳实践，为你的全栈开发之路奠定了坚实的基础。

**下一步建议：**
- 添加更多功能（如文章点赞、收藏等）
- 优化性能（如缓存、CDN等）
- 添加测试用例
- 部署到云服务器
