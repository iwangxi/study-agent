# Docker 容器化部署

## 🎯 学习目标

通过本章节的学习，你将掌握：
- Docker 的核心概念和基本操作
- 容器化 NestJS 和 Vue3 应用
- 多阶段构建和镜像优化
- Docker Compose 编排服务

## 📚 Docker 简介

Docker 是一个开源的容器化平台，它允许开发者将应用程序及其依赖项打包到轻量级、可移植的容器中，确保应用在任何环境中都能一致运行。

### 🌟 核心优势

- **环境一致性** - 开发、测试、生产环境完全一致
- **快速部署** - 秒级启动，快速扩缩容
- **资源高效** - 比虚拟机更轻量，资源利用率高
- **易于管理** - 统一的容器管理和编排
- **微服务友好** - 天然支持微服务架构

## 🚀 Docker 基础

### 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# macOS (使用 Homebrew)
brew install --cask docker

# Windows
# 下载 Docker Desktop for Windows
```

### 基本命令

```bash
# 查看 Docker 版本
docker --version

# 拉取镜像
docker pull node:18-alpine

# 查看镜像列表
docker images

# 运行容器
docker run -d -p 3000:3000 --name my-app node:18-alpine

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop my-app

# 删除容器
docker rm my-app

# 删除镜像
docker rmi node:18-alpine
```

## 🏗️ 容器化 NestJS 应用

### 基础 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:prod"]
```

### 多阶段构建优化

```dockerfile
# 多阶段构建 Dockerfile
# 阶段1: 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY tsconfig*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY src/ ./src/

# 构建应用
RUN npm run build

# 阶段2: 生产阶段
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 更改文件所有者
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 环境变量配置

```dockerfile
# Dockerfile with environment variables
FROM node:18-alpine

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

EXPOSE $PORT

CMD ["npm", "run", "start:prod"]
```

## 🎨 容器化 Vue3 应用

### Vue3 应用 Dockerfile

```dockerfile
# Vue3 应用多阶段构建
# 阶段1: 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 阶段2: 生产阶段 - 使用 Nginx
FROM nginx:alpine AS production

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 处理 Vue Router 的 history 模式
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 代理（如果需要）
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🐳 Docker Compose 编排

### 基础 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  # 数据库服务
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 开发环境配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "9229:9229" # 调试端口
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/myapp_dev
    command: npm run start:debug

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

### 生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`myapp.com`)"
      - "traefik.http.routers.frontend.tls=true"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.myapp.com`)"
      - "traefik.http.routers.backend.tls=true"

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  # 反向代理
  traefik:
    image: traefik:v2.10
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml
      - ./acme.json:/acme.json

volumes:
  postgres_data:
  redis_data:
```

## 🔧 镜像优化

### .dockerignore 文件

```dockerignore
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
.idea
*.log
dist
build
.DS_Store
Thumbs.db
```

### 镜像大小优化

```dockerfile
# 优化后的 Dockerfile
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache dumb-init

# 创建应用目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 构建阶段
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 开发依赖阶段
FROM base AS build-deps
COPY package*.json ./
RUN npm ci

# 构建阶段
FROM build-deps AS build
COPY . .
RUN npm run build

# 生产阶段
FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

# 更改所有者
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# 使用 dumb-init 作为 PID 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
```

## 📊 监控和日志

### 健康检查

```dockerfile
# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### 日志配置

```yaml
# docker-compose.yml 中的日志配置
services:
  backend:
    build: ./backend
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "logging=true"
```

### 监控集成

```yaml
# 添加监控服务
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🚀 部署脚本

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 开始部署应用..."

# 拉取最新代码
git pull origin main

# 构建镜像
echo "📦 构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml build

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose -f docker-compose.prod.yml down

# 启动新容器
echo "▶️ 启动新容器..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 执行健康检查..."
if curl -f http://localhost/health; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，回滚..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "🎉 部署完成！"
```

## 📖 学习资源

### 官方资源
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

### 最佳实践
- [Docker 最佳实践](https://docs.docker.com/develop/best-practices/)
- [Node.js Docker 最佳实践](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

🎉 **恭喜！** 你已经掌握了Docker容器化部署的核心技能。接下来可以学习 [CI/CD 自动化部署](/devops/cicd) 或 [Kubernetes 容器编排](/devops/kubernetes)。
