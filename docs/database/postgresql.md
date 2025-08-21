# PostgreSQL 数据库设计与优化

## 🎯 学习目标

通过本章节的学习，你将掌握：
- PostgreSQL 数据库设计原则
- 索引策略和查询优化
- 性能监控和调优技巧
- 高可用和备份策略

## 📚 PostgreSQL 简介

PostgreSQL 是一个功能强大的开源关系型数据库管理系统，以其可靠性、功能丰富性和性能著称。它支持 SQL 标准，并提供了许多高级特性。

### 🌟 核心特性

- **ACID 兼容** - 完整的事务支持
- **丰富数据类型** - JSON、数组、自定义类型等
- **扩展性** - 支持自定义函数和扩展
- **并发控制** - MVCC 多版本并发控制
- **全文搜索** - 内置全文搜索功能

## 🏗️ 数据库设计原则

### 规范化设计

```sql
-- 第一范式 (1NF) - 原子性
-- 错误示例
CREATE TABLE users_bad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phones TEXT  -- 存储多个电话号码，违反1NF
);

-- 正确示例
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user_phones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    phone VARCHAR(20),
    type VARCHAR(10) -- 'mobile', 'home', 'work'
);
```

```sql
-- 第二范式 (2NF) - 消除部分依赖
-- 错误示例
CREATE TABLE order_items_bad (
    order_id INTEGER,
    product_id INTEGER,
    product_name VARCHAR(100),  -- 依赖于 product_id，不依赖于组合键
    quantity INTEGER,
    price DECIMAL(10,2),
    PRIMARY KEY (order_id, product_id)
);

-- 正确示例
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10,2),  -- 订单时的价格
    PRIMARY KEY (order_id, product_id)
);
```

### 数据类型选择

```sql
-- 选择合适的数据类型
CREATE TABLE optimized_table (
    -- 使用 SERIAL 而不是 INTEGER + SEQUENCE
    id SERIAL PRIMARY KEY,
    
    -- 使用 VARCHAR 而不是 TEXT（如果有长度限制）
    email VARCHAR(255) NOT NULL,
    
    -- 使用 BOOLEAN 而不是 CHAR(1)
    is_active BOOLEAN DEFAULT true,
    
    -- 使用 TIMESTAMP WITH TIME ZONE 存储时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 使用 NUMERIC 存储精确的货币值
    balance NUMERIC(12,2) DEFAULT 0.00,
    
    -- 使用 JSONB 而不是 JSON（更好的性能）
    metadata JSONB,
    
    -- 使用数组类型
    tags TEXT[],
    
    -- 使用枚举类型
    status user_status_enum DEFAULT 'active'
);

-- 创建枚举类型
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended');
```

## 📊 索引策略

### 基础索引类型

```sql
-- B-tree 索引（默认）
CREATE INDEX idx_users_email ON users(email);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 复合索引
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- GIN 索引（用于数组、JSONB、全文搜索）
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- GiST 索引（用于几何数据、全文搜索）
CREATE INDEX idx_locations_point ON locations USING GIST(coordinates);
```

### 高级索引技巧

```sql
-- 覆盖索引（包含所需的所有列）
CREATE INDEX idx_orders_covering 
ON orders(user_id, status) 
INCLUDE (total_amount, created_at);

-- 条件索引优化
CREATE INDEX idx_pending_orders 
ON orders(created_at) 
WHERE status = 'pending';

-- JSONB 索引优化
-- 为特定 JSON 路径创建索引
CREATE INDEX idx_user_preferences_theme 
ON users((metadata->>'theme'));

-- 为 JSON 数组元素创建索引
CREATE INDEX idx_user_roles 
ON users USING GIN((metadata->'roles'));
```

## 🔍 查询优化

### 查询分析

```sql
-- 使用 EXPLAIN 分析查询计划
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 查询优化技巧

```sql
-- 使用 EXISTS 而不是 IN（对于大数据集）
-- 慢查询
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- 优化后
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.total > 1000
);

-- 使用 LIMIT 和 OFFSET 的替代方案（游标分页）
-- 传统分页（性能随页数增加而下降）
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 10000;

-- 游标分页（性能稳定）
SELECT * FROM posts 
WHERE created_at < '2024-01-01 12:00:00'
ORDER BY created_at DESC 
LIMIT 20;

-- 使用窗口函数优化排名查询
SELECT 
    user_id,
    total_amount,
    ROW_NUMBER() OVER (ORDER BY total_amount DESC) as rank
FROM orders
WHERE created_at >= '2024-01-01';
```

### 批量操作优化

```sql
-- 批量插入优化
-- 使用 COPY 命令（最快）
COPY users(name, email) FROM '/path/to/data.csv' WITH CSV HEADER;

-- 使用 INSERT ... VALUES 批量插入
INSERT INTO users(name, email) VALUES 
    ('User 1', 'user1@example.com'),
    ('User 2', 'user2@example.com'),
    ('User 3', 'user3@example.com');

-- 使用 INSERT ... SELECT
INSERT INTO user_stats(user_id, order_count, total_spent)
SELECT 
    u.id,
    COUNT(o.id),
    COALESCE(SUM(o.total), 0)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;

-- 批量更新优化
UPDATE orders 
SET status = 'shipped'
FROM (
    SELECT id FROM orders 
    WHERE status = 'processing' 
    AND created_at < NOW() - INTERVAL '1 day'
    LIMIT 1000
) AS batch
WHERE orders.id = batch.id;
```

## 📈 性能监控

### 系统监控查询

```sql
-- 查看当前活动连接
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity
WHERE state = 'active';

-- 查看慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 查看表统计信息
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- 查看索引效率
SELECT 
    t.tablename,
    indexname,
    c.reltuples AS num_rows,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::text)) AS table_size,
    pg_size_pretty(pg_relation_size(quote_ident(indexrelname)::text)) AS index_size,
    CASE WHEN indisunique THEN 'Y' ELSE 'N' END AS UNIQUE,
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_tables t
LEFT OUTER JOIN pg_class c ON c.relname=t.tablename
LEFT OUTER JOIN (
    SELECT 
        c.relname AS ctablename, 
        ipg.relname AS indexname, 
        x.indnatts AS number_of_columns, 
        idx_scan, 
        idx_tup_read, 
        idx_tup_fetch, 
        indexrelname, 
        indisunique 
    FROM pg_index x
    JOIN pg_class c ON c.oid = x.indrelid
    JOIN pg_class ipg ON ipg.oid = x.indexrelid
    JOIN pg_stat_all_indexes psai ON x.indexrelid = psai.indexrelid
) AS foo ON t.tablename = foo.ctablename
WHERE t.schemaname='public'
ORDER BY 1,2;
```

### 配置优化

```sql
-- 查看当前配置
SHOW ALL;

-- 重要配置参数
-- postgresql.conf 配置示例

# 内存配置
shared_buffers = 256MB          # 共享缓冲区
effective_cache_size = 1GB      # 有效缓存大小
work_mem = 4MB                  # 工作内存
maintenance_work_mem = 64MB     # 维护工作内存

# 连接配置
max_connections = 100           # 最大连接数
superuser_reserved_connections = 3

# 检查点配置
checkpoint_completion_target = 0.7
wal_buffers = 16MB
checkpoint_timeout = 5min

# 日志配置
log_statement = 'all'           # 记录所有语句
log_min_duration_statement = 1000  # 记录超过1秒的查询
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# 自动清理配置
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

## 🔧 维护操作

### VACUUM 和 ANALYZE

```sql
-- 手动 VACUUM
VACUUM VERBOSE users;

-- VACUUM FULL（重建表，需要排他锁）
VACUUM FULL users;

-- ANALYZE 更新统计信息
ANALYZE users;

-- VACUUM ANALYZE 组合操作
VACUUM ANALYZE users;

-- 查看表膨胀情况
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup * 100.0 / (n_live_tup + n_dead_tup), 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE n_live_tup > 0
ORDER BY dead_ratio DESC;
```

### 重建索引

```sql
-- 重建单个索引
REINDEX INDEX idx_users_email;

-- 重建表的所有索引
REINDEX TABLE users;

-- 并发重建索引（不阻塞读写）
CREATE INDEX CONCURRENTLY idx_users_email_new ON users(email);
DROP INDEX idx_users_email;
ALTER INDEX idx_users_email_new RENAME TO idx_users_email;
```

## 🛡️ 备份和恢复

### 逻辑备份

```bash
# 备份单个数据库
pg_dump -h localhost -U postgres -d myapp > myapp_backup.sql

# 备份所有数据库
pg_dumpall -h localhost -U postgres > all_databases.sql

# 压缩备份
pg_dump -h localhost -U postgres -d myapp | gzip > myapp_backup.sql.gz

# 自定义格式备份（支持并行恢复）
pg_dump -h localhost -U postgres -d myapp -Fc > myapp_backup.dump

# 恢复数据库
psql -h localhost -U postgres -d myapp < myapp_backup.sql

# 恢复自定义格式备份
pg_restore -h localhost -U postgres -d myapp myapp_backup.dump
```

### 物理备份

```bash
# 基础备份
pg_basebackup -h localhost -U postgres -D /backup/base -Ft -z -P

# 连续归档备份配置
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# 时间点恢复
# recovery.conf
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2024-01-01 12:00:00'
```

## 🔐 安全配置

### 用户和权限管理

```sql
-- 创建用户
CREATE USER app_user WITH PASSWORD 'secure_password';

-- 创建角色
CREATE ROLE readonly;
CREATE ROLE readwrite;

-- 授予权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO readwrite;

-- 将角色分配给用户
GRANT readonly TO app_user;

-- 行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_policy ON users
    FOR ALL TO app_user
    USING (user_id = current_user_id());
```

### 连接安全

```bash
# pg_hba.conf 配置示例
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# 本地连接
local   all             postgres                                peer
local   all             all                                     md5

# IPv4 连接
host    all             all             127.0.0.1/32            md5
host    myapp           app_user        10.0.0.0/8              md5

# SSL 连接
hostssl all             all             0.0.0.0/0               md5
```

## 📖 学习资源

### 官方文档
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [性能调优指南](https://wiki.postgresql.org/wiki/Performance_Optimization)

### 工具推荐
- **pgAdmin** - 图形化管理工具
- **pg_stat_statements** - 查询统计扩展
- **pgbench** - 性能测试工具
- **pg_top** - 实时监控工具

---

🎉 **恭喜！** 你已经掌握了PostgreSQL数据库设计和优化的核心技能。这些知识将帮助你构建高性能、可扩展的数据库系统。
