# CI/CD 持续集成与部署

## 🎯 学习目标

通过本章节的学习，你将掌握：
- CI/CD 的核心概念和最佳实践
- GitHub Actions 工作流设计
- 自动化测试和部署流程
- 多环境部署策略

## 📚 CI/CD 简介

CI/CD 是持续集成（Continuous Integration）和持续部署（Continuous Deployment）的缩写，是现代软件开发中的核心实践，旨在通过自动化来提高软件交付的速度和质量。

### 🌟 核心优势

- **快速反馈** - 及时发现和修复问题
- **降低风险** - 小步快跑，减少部署风险
- **提高效率** - 自动化减少手动操作
- **保证质量** - 自动化测试确保代码质量
- **一致性** - 标准化的部署流程

## 🔄 CI/CD 流程

### 持续集成 (CI)

```mermaid
graph LR
    A[代码提交] --> B[触发构建]
    B --> C[代码检查]
    C --> D[单元测试]
    D --> E[集成测试]
    E --> F[构建镜像]
    F --> G[推送仓库]
```

### 持续部署 (CD)

```mermaid
graph LR
    A[镜像仓库] --> B[部署测试环境]
    B --> C[自动化测试]
    C --> D[部署预生产]
    D --> E[验收测试]
    E --> F[部署生产环境]
    F --> G[监控告警]
```

## 🚀 GitHub Actions 入门

### 基础概念

- **Workflow** - 工作流，定义自动化流程
- **Job** - 作业，工作流中的执行单元
- **Step** - 步骤，作业中的具体操作
- **Action** - 动作，可复用的操作单元
- **Runner** - 运行器，执行工作流的环境

### 工作流文件结构

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🏗️ 全栈应用 CI/CD

### 前端应用工作流

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ./frontend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:unit
      
      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

### 后端应用工作流

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths: ['backend/**']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/backend

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ./backend
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run migration:run
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main
            docker stop backend || true
            docker rm backend || true
            docker run -d \
              --name backend \
              --restart unless-stopped \
              -p 3000:3000 \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main
```

## 🔧 高级工作流模式

### 矩阵构建

```yaml
# 多版本测试
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]

steps:
  - uses: actions/checkout@v4
  - name: Setup Node.js ${{ matrix.node-version }}
    uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
  - run: npm ci
  - run: npm test
```

### 条件执行

```yaml
# 条件部署
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: echo "Deploying to staging"

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: echo "Deploying to production"

# 基于文件变更的条件执行
- name: Check for frontend changes
  uses: dorny/paths-filter@v2
  id: changes
  with:
    filters: |
      frontend:
        - 'frontend/**'
      backend:
        - 'backend/**'

- name: Build frontend
  if: steps.changes.outputs.frontend == 'true'
  run: npm run build:frontend
```

### 可复用工作流

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      working-directory:
        required: true
        type: string
    secrets:
      DATABASE_URL:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

```yaml
# 使用可复用工作流
jobs:
  test-frontend:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
      working-directory: './frontend'
    secrets:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 🌍 多环境部署

### 环境配置

```yaml
# 环境保护规则
environment:
  name: production
  url: https://myapp.com

# 环境变量
env:
  ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
  API_URL: ${{ github.ref == 'refs/heads/main' && secrets.PROD_API_URL || secrets.STAGING_API_URL }}
```

### 蓝绿部署

```yaml
# 蓝绿部署策略
- name: Deploy to blue environment
  run: |
    docker run -d \
      --name app-blue \
      -p 3001:3000 \
      ${{ env.IMAGE_NAME }}:${{ github.sha }}

- name: Health check
  run: |
    for i in {1..30}; do
      if curl -f http://localhost:3001/health; then
        echo "Health check passed"
        break
      fi
      sleep 10
    done

- name: Switch traffic
  run: |
    # 更新负载均衡器配置
    # 停止绿色环境
    docker stop app-green || true
    docker rm app-green || true
    # 重命名蓝色为绿色
    docker rename app-blue app-green
    docker run -d \
      --name app-blue \
      -p 3000:3000 \
      ${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### 金丝雀部署

```yaml
# 金丝雀部署
- name: Deploy canary
  run: |
    # 部署到 10% 的服务器
    kubectl set image deployment/app app=${{ env.IMAGE_NAME }}:${{ github.sha }}
    kubectl patch deployment app -p '{"spec":{"replicas":1}}'

- name: Monitor metrics
  run: |
    # 监控错误率和响应时间
    sleep 300  # 等待 5 分钟
    ERROR_RATE=$(curl -s http://monitoring/api/error-rate)
    if [ "$ERROR_RATE" -gt "5" ]; then
      echo "Error rate too high, rolling back"
      kubectl rollout undo deployment/app
      exit 1
    fi

- name: Full deployment
  run: |
    # 扩展到全部服务器
    kubectl patch deployment app -p '{"spec":{"replicas":10}}'
```

## 🔐 安全最佳实践

### 密钥管理

```yaml
# 使用 GitHub Secrets
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}

# 使用 OIDC 进行云服务认证
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

### 安全扫描

```yaml
# 依赖漏洞扫描
- name: Run security audit
  run: npm audit --audit-level high

# 代码安全扫描
- name: Run CodeQL Analysis
  uses: github/codeql-action/init@v2
  with:
    languages: javascript, typescript

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2

# Docker 镜像安全扫描
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.IMAGE_NAME }}:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## 📊 监控和通知

### 部署通知

```yaml
# Slack 通知
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    fields: repo,message,commit,author,action,eventName,ref,workflow

# 邮件通知
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "Deployment Failed: ${{ github.repository }}"
    body: "Deployment failed for commit ${{ github.sha }}"
    to: team@company.com
```

### 性能监控

```yaml
# 部署后性能测试
- name: Run performance tests
  run: |
    npm install -g lighthouse
    lighthouse https://myapp.com \
      --chrome-flags="--headless" \
      --output=json \
      --output-path=./lighthouse-report.json

- name: Check performance budget
  run: |
    PERFORMANCE_SCORE=$(cat lighthouse-report.json | jq '.categories.performance.score * 100')
    if [ "$PERFORMANCE_SCORE" -lt "90" ]; then
      echo "Performance score $PERFORMANCE_SCORE is below threshold"
      exit 1
    fi
```

## 🎯 最佳实践

### 工作流优化

1. **并行执行** - 合理使用 `needs` 和并行作业
2. **缓存策略** - 缓存依赖和构建产物
3. **条件执行** - 避免不必要的步骤执行
4. **资源限制** - 合理设置超时和资源限制

### 代码质量

```yaml
# 代码质量检查
- name: Run ESLint
  run: npm run lint

- name: Run Prettier
  run: npm run format:check

- name: Type checking
  run: npm run type-check

- name: Test coverage
  run: npm run test:coverage
  
- name: Check coverage threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if [ "$COVERAGE" -lt "80" ]; then
      echo "Coverage $COVERAGE% is below 80% threshold"
      exit 1
    fi
```

### 部署策略

1. **渐进式部署** - 蓝绿部署、金丝雀部署
2. **回滚机制** - 快速回滚到上一个稳定版本
3. **健康检查** - 部署后自动健康检查
4. **监控告警** - 实时监控和告警机制

## 📖 学习资源

### 官方文档
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [工作流语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### 最佳实践
- [CI/CD 最佳实践](https://docs.github.com/en/actions/guides)
- [安全强化指南](https://docs.github.com/en/actions/security-guides)

---

🎉 **恭喜！** 你已经掌握了CI/CD的核心概念和GitHub Actions的实际应用。通过自动化的CI/CD流程，你可以显著提高开发效率和代码质量。
