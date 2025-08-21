import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NestJS + Vue3 全栈开发学习指南',
  description: '专注于 NestJS + Vue3 + TypeORM 技术栈的全栈开发学习资源',
  
  // 部署配置
  base: '/study-agent/',
  
  themeConfig: {
    // 网站logo
    logo: '/logo.svg',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路线', link: '/roadmap/' },
      { 
        text: '前端技术', 
        items: [
          { text: 'Vue3 基础', link: '/frontend/vue3/' },
          { text: 'TypeScript', link: '/frontend/typescript/' },
          { text: 'Vite 构建工具', link: '/frontend/vite/' },
        { text: '性能优化', link: '/frontend/performance' },
          { text: '状态管理', link: '/frontend/state-management/' }
        ]
      },
      { 
        text: '后端技术', 
        items: [
          { text: 'NestJS 框架', link: '/backend/nestjs/' },
          { text: 'TypeORM', link: '/backend/typeorm/' },
          { text: 'GraphQL', link: '/backend/graphql/' },
          { text: 'RESTful API', link: '/backend/restful/' }
        ]
      },
      { 
        text: '数据库', 
        items: [
          { text: 'PostgreSQL', link: '/database/postgresql/' },
          { text: 'MySQL', link: '/database/mysql/' },
          { text: 'Redis', link: '/database/redis/' }
        ]
      },
      { 
        text: 'DevOps', 
        items: [
          { text: 'Docker', link: '/devops/docker/' },
          { text: 'CI/CD', link: '/devops/cicd/' },
          { text: '部署', link: '/devops/deployment/' }
        ]
      },
      { text: '测试', link: '/testing/' },
      { text: '实战项目', link: '/projects/' },
      { text: '面试指南', link: '/interview/' }
    ],

    // 侧边栏
    sidebar: {
      '/roadmap/': [
        {
          text: '学习路线图',
          items: [
            { text: '总体规划', link: '/roadmap/' },
            { text: '前端路线', link: '/roadmap/frontend' },
            { text: '后端路线', link: '/roadmap/backend' },
            { text: '全栈整合', link: '/roadmap/fullstack' }
          ]
        }
      ],
      '/frontend/': [
        {
          text: 'Vue3 生态',
          items: [
            { text: 'Vue3 核心', link: '/frontend/vue3/' },
            { text: 'Composition API', link: '/frontend/vue3/composition-api' },
            { text: 'Vue Router', link: '/frontend/vue3/router' },
            { text: 'Pinia 状态管理', link: '/frontend/vue3/pinia' },
            { text: 'Vue3 高级特性', link: '/frontend/vue3/advanced' }
          ]
        },
        {
          text: 'TypeScript',
          items: [
            { text: 'TS 基础', link: '/frontend/typescript/' },
            { text: '高级类型', link: '/frontend/typescript/advanced' },
            { text: '装饰器', link: '/frontend/typescript/decorators' }
          ]
        },
        {
          text: '构建工具',
          items: [
            { text: 'Vite', link: '/frontend/vite/' },
            { text: '插件生态', link: '/frontend/vite/plugins' }
          ]
        },
        {
          text: '性能优化',
          items: [
            { text: '性能优化指南', link: '/frontend/performance' },
            { text: '构建优化', link: '/frontend/build-optimization' },
            { text: '运行时优化', link: '/frontend/runtime-optimization' }
          ]
        }
      ],
      '/devops/': [
        {
          text: 'DevOps 实践',
          items: [
            { text: 'Docker 容器化', link: '/devops/docker' },
            { text: 'CI/CD 流程', link: '/devops/cicd' },
            { text: '部署策略', link: '/devops/deployment' },
            { text: '监控运维', link: '/devops/monitoring' }
          ]
        }
      ],
      '/database/': [
        {
          text: '数据库技术',
          items: [
            { text: 'PostgreSQL', link: '/database/postgresql' },
            { text: 'MySQL', link: '/database/mysql' },
            { text: 'Redis', link: '/database/redis' },
            { text: '数据库设计', link: '/database/design' }
          ]
        }
      ],
      '/projects/': [
        {
          text: '实战项目',
          items: [
            { text: '项目概览', link: '/projects/' },
            { text: '个人博客系统', link: '/projects/blog-system' },
            { text: '待办事项管理', link: '/projects/todo-app' },
            { text: '电商管理后台', link: '/projects/ecommerce-admin' },
            { text: '在线教育平台', link: '/projects/education-platform' }
          ]
        }
      ],
      '/interview/': [
        {
          text: '面试指南',
          items: [
            { text: '面试准备', link: '/interview/' },
            { text: '前端面试题', link: '/interview/frontend' },
            { text: '后端面试题', link: '/interview/backend' },
            { text: '系统设计', link: '/interview/system-design' },
            { text: '项目经验', link: '/interview/project-experience' }
          ]
        }
      ],
      '/testing/': [
        {
          text: '测试指南',
          items: [
            { text: '测试概览', link: '/testing/' },
            { text: '单元测试', link: '/testing/unit' },
            { text: '集成测试', link: '/testing/integration' },
            { text: 'E2E 测试', link: '/testing/e2e' },
            { text: '测试最佳实践', link: '/testing/best-practices' }
          ]
        }
      ],
      '/backend/': [
        {
          text: 'NestJS 框架',
          items: [
            { text: 'NestJS 入门', link: '/backend/nestjs/' },
            { text: '控制器', link: '/backend/nestjs/controllers' },
            { text: '服务与依赖注入', link: '/backend/nestjs/services' },
            { text: '模块系统', link: '/backend/nestjs/modules' },
            { text: '中间件', link: '/backend/nestjs/middleware' },
            { text: '守卫与拦截器', link: '/backend/nestjs/guards' },
            { text: '异常处理', link: '/backend/nestjs/exceptions' },
            { text: '微服务架构', link: '/backend/nestjs/microservices' }
          ]
        },
        {
          text: 'TypeORM',
          items: [
            { text: 'TypeORM 基础', link: '/backend/typeorm/' },
            { text: '实体定义', link: '/backend/typeorm/entities' },
            { text: '关系映射', link: '/backend/typeorm/relations' },
            { text: '查询构建器', link: '/backend/typeorm/query-builder' },
            { text: '迁移', link: '/backend/typeorm/migrations' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/iwangxi/study-agent' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 NestJS + Vue3 全栈学习指南'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/iwangxi/study-agent/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // 忽略死链接检查（临时）
  ignoreDeadLinks: true
})
