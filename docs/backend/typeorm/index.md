# TypeORM 数据库操作指南

## 🎯 学习目标

通过本章节的学习，你将掌握：
- TypeORM 的核心概念和配置
- 实体定义和关系映射
- 查询构建器的高级用法
- 数据库迁移和性能优化

## 📚 TypeORM 简介

TypeORM 是一个运行在 Node.js、Browser、Cordova、PhoneGap、Ionic、React Native、NativeScript、Expo 和 Electron 平台上的 ORM 框架，可以与 TypeScript 和 JavaScript 一起使用。

### 🌟 核心特性

- **类型安全** - 完整的 TypeScript 支持
- **装饰器模式** - 使用装饰器定义实体和关系
- **多数据库支持** - MySQL、PostgreSQL、SQLite、MongoDB 等
- **迁移系统** - 自动生成和执行数据库迁移
- **查询构建器** - 类型安全的查询构建

## 🚀 快速开始

### 安装依赖

```bash
# 安装 TypeORM 和数据库驱动
npm install typeorm reflect-metadata

# PostgreSQL 驱动
npm install pg @types/pg

# MySQL 驱动
npm install mysql2

# SQLite 驱动
npm install sqlite3
```

### 基础配置

```typescript
// ormconfig.ts
import { DataSource } from 'typeorm';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'myapp',
  synchronize: true, // 开发环境使用，生产环境设为 false
  logging: true,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});
```

## 🏗️ 实体定义

### 基础实体

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 高级字段类型

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('json')
  metadata: Record<string, any>;

  @Column('enum', { enum: ['draft', 'published', 'archived'] })
  status: 'draft' | 'published' | 'archived';

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  publishedAt: Date;
}
```

## 🔗 关系映射

### 一对一关系

```typescript
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;
}
```

### 一对多关系

```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category;
}
```

### 多对多关系

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
```

## 🔍 查询操作

### Repository 模式

```typescript
import { Repository } from 'typeorm';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  // 创建用户
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  // 查找用户
  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'roles']
    });
  }

  // 分页查询
  async findUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 更新用户
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return await this.findUserById(id);
  }

  // 删除用户
  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### 查询构建器

```typescript
export class UserService {
  // 复杂查询
  async findActiveUsersWithPosts() {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('post.publishedAt IS NOT NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  // 聚合查询
  async getUserStats() {
    return await this.userRepository
      .createQueryBuilder('user')
      .select([
        'COUNT(user.id) as totalUsers',
        'COUNT(CASE WHEN user.isActive = true THEN 1 END) as activeUsers',
        'AVG(EXTRACT(YEAR FROM AGE(user.createdAt))) as avgAccountAge'
      ])
      .getRawOne();
  }

  // 子查询
  async findUsersWithMostPosts() {
    const subQuery = this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .leftJoin('user.posts', 'post')
      .groupBy('user.id')
      .orderBy('COUNT(post.id)', 'DESC')
      .limit(10);

    return await this.userRepository
      .createQueryBuilder('user')
      .where(`user.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .getMany();
  }
}
```

## 🔄 事务处理

### 基础事务

```typescript
import { AppDataSource } from '../ormconfig';

export class TransactionService {
  async transferMoney(fromUserId: number, toUserId: number, amount: number) {
    return await AppDataSource.transaction(async manager => {
      // 扣除发送方余额
      await manager.decrement(User, { id: fromUserId }, 'balance', amount);
      
      // 增加接收方余额
      await manager.increment(User, { id: toUserId }, 'balance', amount);
      
      // 创建转账记录
      const transaction = manager.create(Transaction, {
        fromUserId,
        toUserId,
        amount,
        type: 'transfer'
      });
      
      return await manager.save(transaction);
    });
  }
}
```

### 手动事务控制

```typescript
export class OrderService {
  async createOrder(orderData: CreateOrderDto) {
    const queryRunner = AppDataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 创建订单
      const order = queryRunner.manager.create(Order, orderData);
      await queryRunner.manager.save(order);
      
      // 减少库存
      for (const item of orderData.items) {
        await queryRunner.manager.decrement(
          Product, 
          { id: item.productId }, 
          'stock', 
          item.quantity
        );
      }
      
      // 创建订单项
      const orderItems = orderData.items.map(item => 
        queryRunner.manager.create(OrderItem, { ...item, orderId: order.id })
      );
      await queryRunner.manager.save(orderItems);
      
      await queryRunner.commitTransaction();
      return order;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## 📈 性能优化

### 查询优化

```typescript
export class OptimizedUserService {
  // 使用索引
  @Entity('users')
  @Index(['email']) // 单列索引
  @Index(['firstName', 'lastName']) // 复合索引
  export class User {
    @Column({ unique: true })
    @Index() // 字段级索引
    email: string;
  }

  // 预加载关系
  async findUsersWithRelations() {
    return await this.userRepository.find({
      relations: {
        profile: true,
        posts: {
          category: true,
          tags: true
        }
      }
    });
  }

  // 延迟加载
  async findUserWithLazyPosts(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'] // 只加载必要的关系
    });
    
    // 按需加载文章
    if (user && needPosts) {
      user.posts = await this.postRepository.find({
        where: { authorId: id }
      });
    }
    
    return user;
  }

  // 批量操作
  async bulkCreateUsers(usersData: CreateUserDto[]) {
    return await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(usersData)
      .execute();
  }
}
```

### 缓存策略

```typescript
import { Cache } from 'cache-manager';

export class CachedUserService {
  constructor(
    private userRepository: Repository<User>,
    private cacheManager: Cache
  ) {}

  async findUserById(id: number): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // 尝试从缓存获取
    let user = await this.cacheManager.get<User>(cacheKey);
    
    if (!user) {
      // 缓存未命中，从数据库查询
      user = await this.userRepository.findOne({ where: { id } });
      
      if (user) {
        // 缓存结果，TTL 5分钟
        await this.cacheManager.set(cacheKey, user, 300);
      }
    }
    
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.save({ id, ...updateData });
    
    // 更新缓存
    const cacheKey = `user:${id}`;
    await this.cacheManager.set(cacheKey, user, 300);
    
    return user;
  }
}
```

## 📖 学习资源

### 官方资源
- [TypeORM 官方文档](https://typeorm.io/)
- [TypeORM GitHub](https://github.com/typeorm/typeorm)

### 实战教程
- [NestJS + TypeORM 实战](https://docs.nestjs.com/techniques/database)
- [TypeORM 最佳实践](https://github.com/typeorm/typeorm/blob/master/docs/best-practices.md)

---

🎉 **恭喜！** 你已经掌握了TypeORM的核心用法。接下来可以学习 [实体关系设计](/backend/typeorm/entities) 或 [查询优化技巧](/backend/typeorm/query-builder)。
