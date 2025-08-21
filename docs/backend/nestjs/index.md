# NestJS 企业级框架

## 🎯 学习目标

通过本章节的学习，你将掌握：
- NestJS 的核心概念和架构设计
- 依赖注入和模块系统
- 控制器、服务和中间件的使用
- 企业级应用开发的最佳实践

## 📚 NestJS 简介

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用现代 JavaScript，完全支持 TypeScript，并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

### 🌟 核心特性

- **TypeScript 优先** - 原生 TypeScript 支持
- **装饰器模式** - 基于装饰器的声明式编程
- **依赖注入** - 强大的 IoC 容器
- **模块化架构** - 清晰的模块组织结构
- **企业级特性** - 内置测试、验证、缓存等功能

## 🚀 快速开始

### 环境准备

```bash
# 安装 NestJS CLI
npm install -g @nestjs/cli

# 创建新项目
nest new my-nest-app

# 进入项目目录
cd my-nest-app

# 启动开发服务器
npm run start:dev
```

### 项目结构

```
src/
├── app.controller.ts      # 应用控制器
├── app.controller.spec.ts # 控制器测试
├── app.module.ts          # 应用根模块
├── app.service.ts         # 应用服务
└── main.ts               # 应用入口文件
```

## 🏗️ 核心概念

### 控制器 (Controllers)

控制器负责处理传入的请求并向客户端返回响应。

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(): string {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.catsService.findOne(+id);
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto): string {
    return this.catsService.create(createCatDto);
  }
}
```

### 服务 (Services)

服务用于处理业务逻辑，通常被控制器调用。

```typescript
import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: CreateCatDto): Cat {
    const newCat = { id: Date.now(), ...cat };
    this.cats.push(newCat);
    return newCat;
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: number): Cat {
    return this.cats.find(cat => cat.id === id);
  }

  update(id: number, updateCatDto: UpdateCatDto): Cat {
    const catIndex = this.cats.findIndex(cat => cat.id === id);
    if (catIndex > -1) {
      this.cats[catIndex] = { ...this.cats[catIndex], ...updateCatDto };
      return this.cats[catIndex];
    }
    return null;
  }

  remove(id: number): void {
    const catIndex = this.cats.findIndex(cat => cat.id === id);
    if (catIndex > -1) {
      this.cats.splice(catIndex, 1);
    }
  }
}
```

### 模块 (Modules)

模块是组织应用程序结构的基本单元。

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService], // 导出给其他模块使用
})
export class CatsModule {}
```

### 根模块

```typescript
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 🔧 依赖注入

NestJS 使用强大的依赖注入系统来管理类之间的依赖关系。

### 基本用法

```typescript
// 服务提供者
@Injectable()
export class CatsService {
  // 服务逻辑
}

// 在控制器中注入服务
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}
}

// 在模块中注册
@Module({
  providers: [CatsService],
  controllers: [CatsController],
})
export class CatsModule {}
```

### 自定义提供者

```typescript
@Module({
  providers: [
    // 类提供者
    CatsService,
    
    // 值提供者
    {
      provide: 'CONFIG',
      useValue: { apiKey: 'your-api-key' },
    },
    
    // 工厂提供者
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection();
        return connection;
      },
    },
    
    // 别名提供者
    {
      provide: 'CATS_SERVICE',
      useExisting: CatsService,
    },
  ],
})
export class CatsModule {}
```

## 🛡️ 中间件

中间件是在路由处理程序之前调用的函数。

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  }
}

// 在模块中应用中间件
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

## 🔒 守卫 (Guards)

守卫用于确定请求是否应该由路由处理程序处理。

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // 验证逻辑
    return request.headers.authorization !== undefined;
  }
}

// 使用守卫
@Controller('cats')
@UseGuards(AuthGuard)
export class CatsController {
  // 控制器方法
}
```

## 🔄 拦截器 (Interceptors)

拦截器可以在方法执行前后添加额外的逻辑。

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

// 使用拦截器
@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {
  // 控制器方法
}
```

## 📝 数据传输对象 (DTO)

DTO 用于定义数据在网络上的传输格式。

```typescript
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## 🔍 管道 (Pipes)

管道用于数据转换和验证。

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}

// 使用管道
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

## 🧪 测试

NestJS 提供了强大的测试支持。

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', () => {
      const result = ['test'];
      jest.spyOn(service, 'findAll').mockImplementation(() => result);

      expect(controller.findAll()).toBe(result);
    });
  });
});
```

## 📖 学习资源

### 官方资源
- [NestJS 官方文档](https://nestjs.com/)
- [NestJS 中文文档](https://nestjs.bootcss.com/)
- [NestJS GitHub](https://github.com/nestjs/nest)

### 视频教程
- [NestJS 从入门到实战](https://www.bilibili.com/video/BV1RP4y1p7Xr)
- [NestJS 企业级开发](https://www.bilibili.com/video/BV1Xy4y1v7S2)

### 实战项目
- [NestJS 博客系统](https://github.com/example/nestjs-blog)
- [NestJS 电商后台](https://github.com/example/nestjs-ecommerce)

## 🎯 实践练习

### 练习1：用户管理API
创建一个用户管理系统，包含用户的增删改查功能。

### 练习2：文章管理系统
实现一个文章管理系统，包含分类、标签、评论等功能。

### 练习3：权限管理系统
创建一个基于角色的权限管理系统。

---

🎉 **恭喜！** 你已经掌握了NestJS的核心概念。接下来可以学习 [控制器详解](/backend/nestjs/controllers) 或 [服务与依赖注入](/backend/nestjs/services)。
