# Next.js 学习指南

## 概述

Next.js 是一个基于 React 的生产级框架，提供了服务端渲染 (SSR)、静态站点生成 (SSG)、API 路由等功能，让 React 应用开发更加简单和高效。

## 核心特性

- **零配置**：开箱即用，无需复杂配置
- **混合渲染**：支持 SSR、SSG 和客户端渲染
- **文件系统路由**：基于文件结构自动生成路由
- **API 路由**：内置 API 开发能力
- **自动代码分割**：按页面自动分割代码
- **内置 CSS 支持**：支持 CSS Modules、Sass 等
- **图片优化**：自动图片优化和懒加载
- **TypeScript 支持**：原生 TypeScript 支持

## 快速开始

### 1. 创建项目

```bash
# 使用 create-next-app
npx create-next-app@latest my-app
cd my-app
npm run dev

# 使用 TypeScript
npx create-next-app@latest my-app --typescript

# 使用 Tailwind CSS
npx create-next-app@latest my-app --tailwind
```

### 2. 项目结构

```
my-app/
├── pages/              # 页面目录（路由）
│   ├── api/           # API 路由
│   ├── _app.js        # 应用入口
│   ├── _document.js   # 文档结构
│   └── index.js       # 首页
├── public/            # 静态资源
├── styles/            # 样式文件
├── components/        # 组件目录
├── lib/              # 工具函数
├── next.config.js    # Next.js 配置
└── package.json
```

## 路由系统

### 1. 页面路由

Next.js 使用文件系统路由，`pages` 目录下的文件会自动成为路由。

```
pages/
├── index.js          # / 路由
├── about.js          # /about 路由
├── blog/
│   ├── index.js      # /blog 路由
│   └── [slug].js     # /blog/[slug] 动态路由
└── users/
    ├── index.js      # /users 路由
    ├── [id].js       # /users/[id] 动态路由
    └── [...params].js # /users/[...params] 捕获所有路由
```

### 2. 动态路由

```jsx
// pages/blog/[slug].js
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  return <h1>Blog Post: {slug}</h1>;
}

// pages/users/[...params].js
export default function UserPages() {
  const router = useRouter();
  const { params } = router.query;

  return (
    <div>
      <h1>User Pages</h1>
      <p>Params: {JSON.stringify(params)}</p>
    </div>
  );
}
```

### 3. 路由导航

```jsx
import Link from 'next/link';
import { useRouter } from 'next/router';

function Navigation() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/about');
    // 或者
    router.replace('/about'); // 不会在历史记录中添加新条目
  };

  return (
    <nav>
      {/* 声明式导航 */}
      <Link href="/">
        <a>Home</a>
      </Link>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/blog/hello-world">
        <a>Blog Post</a>
      </Link>
      
      {/* 编程式导航 */}
      <button onClick={handleClick}>Go to About</button>
    </nav>
  );
}
```

## 数据获取

### 1. getStaticProps (SSG)

在构建时获取数据，适用于静态内容。

```jsx
// pages/blog/index.js
export default function Blog({ posts }) {
  return (
    <div>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  // 从 API、数据库或文件系统获取数据
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return {
    props: {
      posts,
    },
    // 可选：重新验证时间（秒）
    revalidate: 60, // ISR (Incremental Static Regeneration)
  };
}
```

### 2. getStaticPaths (SSG with Dynamic Routes)

为动态路由预生成页面。

```jsx
// pages/blog/[slug].js
export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

export async function getStaticPaths() {
  // 获取所有可能的路径
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  const paths = posts.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: false // 或 true、'blocking'
  };
}

export async function getStaticProps({ params }) {
  // 根据 params.slug 获取具体数据
  const res = await fetch(`https://api.example.com/posts/${params.slug}`);
  const post = await res.json();

  return {
    props: {
      post,
    },
  };
}
```

### 3. getServerSideProps (SSR)

在每次请求时获取数据。

```jsx
// pages/dashboard.js
export default function Dashboard({ user, data }) {
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res, query } = context;
  
  // 可以访问请求头、cookies 等
  const token = req.cookies.token;
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // 获取用户数据
  const userRes = await fetch('https://api.example.com/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await userRes.json();

  const dataRes = await fetch('https://api.example.com/dashboard-data');
  const data = await dataRes.json();

  return {
    props: {
      user,
      data,
    },
  };
}
```

### 4. 客户端数据获取

```jsx
import { useState, useEffect } from 'react';
import useSWR from 'swr';

// 使用 useEffect
function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>Hello, {user.name}</div>;
}

// 使用 SWR（推荐）
const fetcher = url => fetch(url).then(res => res.json());

function Profile() {
  const { data: user, error } = useSWR('/api/user', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!user) return <div>Loading...</div>;
  return <div>Hello, {user.name}</div>;
}
```

## API 路由

Next.js 允许你在 `pages/api` 目录下创建 API 端点。

### 1. 基础 API 路由

```jsx
// pages/api/hello.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Hello World' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### 2. 动态 API 路由

```jsx
// pages/api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      // 获取用户
      res.status(200).json({ id, name: `User ${id}` });
      break;
    case 'PUT':
      // 更新用户
      const { name } = req.body;
      res.status(200).json({ id, name });
      break;
    case 'DELETE':
      // 删除用户
      res.status(204).end();
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### 3. 中间件

```jsx
// lib/middleware.js
export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // 验证 token
      const user = await verifyToken(token);
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// pages/api/protected.js
import { withAuth } from '../../lib/middleware';

function handler(req, res) {
  res.status(200).json({ 
    message: 'This is protected',
    user: req.user 
  });
}

export default withAuth(handler);
```

## 样式处理

### 1. CSS Modules

```jsx
// styles/Home.module.css
.container {
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  padding: 4rem 0;
}

// pages/index.js
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Welcome to Next.js!</h1>
      </main>
    </div>
  );
}
```

### 2. Styled JSX

```jsx
export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <style jsx>{`
        h1 {
          color: blue;
          font-size: 2rem;
        }
        div {
          background: #f0f0f0;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}
```

### 3. Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```jsx
// pages/index.js
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Welcome to Next.js with Tailwind!
        </h1>
      </div>
    </div>
  );
}
```

## 图片优化

```jsx
import Image from 'next/image';

export default function Gallery() {
  return (
    <div>
      {/* 本地图片 */}
      <Image
        src="/hero.jpg"
        alt="Hero Image"
        width={800}
        height={600}
        priority // 优先加载
      />
      
      {/* 远程图片 */}
      <Image
        src="https://example.com/image.jpg"
        alt="Remote Image"
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
      
      {/* 响应式图片 */}
      <Image
        src="/responsive.jpg"
        alt="Responsive Image"
        layout="responsive"
        width={800}
        height={600}
      />
    </div>
  );
}
```

## 性能优化

### 1. 代码分割

```jsx
import dynamic from 'next/dynamic';

// 动态导入组件
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 禁用服务端渲染
});

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <DynamicComponent />
    </div>
  );
}
```

### 2. 预加载

```jsx
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();

  const handleMouseEnter = () => {
    router.prefetch('/about');
  };

  return (
    <nav>
      <Link href="/about">
        <a onMouseEnter={handleMouseEnter}>About</a>
      </Link>
    </nav>
  );
}
```

## 部署

### 1. Vercel 部署

```bash
npm install -g vercel
vercel
```

### 2. 静态导出

```bash
# next.config.js
module.exports = {
  trailingSlash: true,
  exportPathMap: function() {
    return {
      '/': { page: '/' },
      '/about': { page: '/about' },
    };
  },
};

# 导出静态文件
npm run build
npm run export
```

### 3. Docker 部署

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 最佳实践

1. **合理选择渲染方式**：根据数据更新频率选择 SSG、SSR 或客户端渲染
2. **使用 TypeScript**：提高代码质量和开发体验
3. **图片优化**：使用 Next.js Image 组件
4. **代码分割**：合理使用动态导入
5. **SEO 优化**：使用 next/head 设置元数据
6. **性能监控**：使用 Next.js Analytics

## 学习资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Next.js 中文文档](https://nextjs.frontendx.cn/)
- [Next.js 示例](https://github.com/vercel/next.js/tree/canary/examples)

## 下一步

- 学习 [Next.js 进阶特性](./advanced.md)
- 了解 [Next.js 部署优化](./deployment.md)
- 探索 [Next.js 与其他技术集成](./integrations.md)
