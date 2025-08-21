# NestJS 微服务架构

## 🎯 学习目标

通过本章节的学习，你将掌握：
- 微服务架构的核心概念和设计原则
- NestJS 微服务的实现方式
- 服务间通信和数据一致性
- 微服务的部署和监控

## 📚 微服务架构简介

微服务架构是一种将单一应用程序开发为一组小型服务的方法，每个服务运行在自己的进程中，并使用轻量级机制（通常是HTTP资源API）进行通信。

### 🌟 核心优势

- **独立部署** - 每个服务可以独立部署和扩展
- **技术多样性** - 不同服务可以使用不同技术栈
- **故障隔离** - 单个服务的故障不会影响整个系统
- **团队自治** - 小团队可以独立开发和维护服务
- **可扩展性** - 可以针对性地扩展特定服务

## 🚀 NestJS 微服务基础

### 创建微服务

```typescript
// main.ts - 微服务启动文件
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建微服务实例
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    },
  );

  await app.listen();
  console.log('User microservice is listening on port 3001');
}

bootstrap();
```

### 混合应用（HTTP + 微服务）

```typescript
// main.ts - 混合应用
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建 HTTP 应用
  const app = await NestFactory.create(AppModule);

  // 连接微服务
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  // 启动所有微服务
  await app.startAllMicroservices();
  
  // 启动 HTTP 服务器
  await app.listen(3000);
  console.log('Gateway is running on port 3000');
}

bootstrap();
```

## 🔄 服务间通信

### TCP 通信

```typescript
// user.controller.ts - 用户服务控制器
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'get_user' })
  async getUser(@Payload() data: { id: number }) {
    return await this.userService.findById(data.id);
  }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: number; userData: UpdateUserDto }) {
    return await this.userService.update(data.id, data.userData);
  }
}
```

### 客户端调用

```typescript
// gateway.controller.ts - 网关控制器
import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class GatewayController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userClient.send({ cmd: 'get_user' }, { id: parseInt(id) });
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    return this.userClient.send({ cmd: 'create_user' }, userData);
  }
}
```

### Redis 消息队列

```typescript
// app.module.ts - 配置 Redis 传输
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### RabbitMQ 消息队列

```typescript
// order.service.ts - 订单服务
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') 
    private readonly notificationClient: ClientProxy,
  ) {}

  async createOrder(orderData: CreateOrderDto) {
    // 创建订单
    const order = await this.orderRepository.save(orderData);

    // 发送通知事件
    this.notificationClient.emit('order_created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
    });

    return order;
  }
}
```

## 🏗️ 微服务架构设计

### 服务拆分策略

```typescript
// 用户服务 (User Service)
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

// 订单服务 (Order Service)
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

// 产品服务 (Product Service)
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

// 通知服务 (Notification Service)
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, SMSService],
})
export class NotificationModule {}
```

### API 网关

```typescript
// gateway.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'user-service', port: 3001 },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'order-service', port: 3002 },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: { host: 'product-service', port: 3003 },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
```

### 服务发现

```typescript
// service-discovery.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ServiceConfig {
  name: string;
  host: string;
  port: number;
  health: string;
}

@Injectable()
export class ServiceDiscoveryService {
  private services: Map<string, ServiceConfig> = new Map();

  constructor(private configService: ConfigService) {
    this.loadServices();
  }

  private loadServices() {
    const services = this.configService.get('microservices');
    services.forEach(service => {
      this.services.set(service.name, service);
    });
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  async checkHealth(serviceName: string): Promise<boolean> {
    const service = this.getService(serviceName);
    if (!service) return false;

    try {
      const response = await fetch(`http://${service.host}:${service.port}${service.health}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getHealthyServices(): Promise<ServiceConfig[]> {
    const healthyServices: ServiceConfig[] = [];
    
    for (const [name, config] of this.services) {
      if (await this.checkHealth(name)) {
        healthyServices.push(config);
      }
    }
    
    return healthyServices;
  }
}
```

## 🔐 安全和认证

### JWT 认证

```typescript
// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      return null;
    }
  }

  generateToken(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      roles: user.roles 
    };
    return this.jwtService.sign(payload);
  }
}
```

### 微服务间认证

```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToRpc().getData();
    const token = request.token;

    if (!token) {
      return false;
    }

    // 验证服务间调用的令牌
    return this.validateServiceToken(token);
  }

  private validateServiceToken(token: string): boolean {
    // 实现服务间认证逻辑
    return token === process.env.SERVICE_SECRET;
  }
}
```

## 📊 数据一致性

### 事件驱动架构

```typescript
// event.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  async publishEvent(event: DomainEvent) {
    // 本地事件发布
    this.eventEmitter.emit(event.type, event);

    // 持久化事件（用于重放）
    await this.saveEvent(event);

    // 发布到消息队列
    await this.publishToMessageQueue(event);
  }

  private async saveEvent(event: DomainEvent) {
    // 保存事件到事件存储
  }

  private async publishToMessageQueue(event: DomainEvent) {
    // 发布到外部消息队列
  }
}
```

### Saga 模式

```typescript
// order.saga.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OrderSaga {
  constructor(
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      // 步骤1: 处理支付
      await this.paymentService.processPayment(event.orderId, event.amount);

      // 步骤2: 减少库存
      await this.inventoryService.reserveItems(event.orderId, event.items);

      // 步骤3: 安排配送
      await this.shippingService.scheduleShipping(event.orderId);

      // 完成订单
      await this.orderService.completeOrder(event.orderId);

    } catch (error) {
      // 补偿操作
      await this.compensateOrder(event.orderId);
    }
  }

  private async compensateOrder(orderId: string) {
    // 回滚支付
    await this.paymentService.refund(orderId);
    
    // 释放库存
    await this.inventoryService.releaseItems(orderId);
    
    // 取消配送
    await this.shippingService.cancelShipping(orderId);
    
    // 取消订单
    await this.orderService.cancelOrder(orderId);
  }
}
```

## 🐳 容器化部署

### Dockerfile

```dockerfile
# user-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - user-service
      - order-service
      - product-service

  user-service:
    build: ./user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/userdb
    depends_on:
      - postgres
      - redis

  order-service:
    build: ./order-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/orderdb
    depends_on:
      - postgres
      - redis

  product-service:
    build: ./product-service
    ports:
      - "3003:3003"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/productdb
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 📈 监控和日志

### 健康检查

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### 分布式追踪

```typescript
// tracing.service.ts
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TracingService {
  generateTraceId(): string {
    return uuidv4();
  }

  generateSpanId(): string {
    return uuidv4();
  }

  createSpan(traceId: string, operationName: string) {
    return {
      traceId,
      spanId: this.generateSpanId(),
      operationName,
      startTime: Date.now(),
    };
  }
}
```

## 📖 学习资源

### 官方资源
- [NestJS 微服务文档](https://docs.nestjs.com/microservices/basics)
- [微服务架构模式](https://microservices.io/)

### 实战项目
- [NestJS 微服务示例](https://github.com/nestjs/nest/tree/master/sample/02-microservices)
- [事件驱动微服务](https://github.com/kamilmysliwiec/nest-microservices)

---

🎉 **恭喜！** 你已经掌握了NestJS微服务架构的核心概念。接下来可以学习 [GraphQL 集成](/backend/nestjs/graphql) 或开始 [企业级项目实战](/projects/)。
