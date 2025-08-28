# React 性能优化指南

## 概述

React 性能优化是构建高质量应用的关键。本指南将介绍各种优化技术和最佳实践，帮助你构建快速、响应式的 React 应用。

## 性能分析工具

### 1. React DevTools Profiler

```jsx
// 在开发环境中使用 Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log('Component:', id);
  console.log('Phase:', phase); // "mount" 或 "update"
  console.log('Actual duration:', actualDuration);
  console.log('Base duration:', baseDuration);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Navigation />
      <Main />
    </Profiler>
  );
}
```

### 2. 浏览器性能工具

```jsx
// 使用 Performance API
function measurePerformance(name, fn) {
  performance.mark(`${name}-start`);
  const result = fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
  
  const measure = performance.getEntriesByName(name)[0];
  console.log(`${name} took ${measure.duration} milliseconds`);
  
  return result;
}

// 使用示例
const result = measurePerformance('expensive-calculation', () => {
  return heavyCalculation(data);
});
```

## 组件优化

### 1. React.memo

防止不必要的重新渲染。

```jsx
import React, { memo } from 'react';

// 基础用法
const ExpensiveComponent = memo(function ExpensiveComponent({ data, onUpdate }) {
  console.log('ExpensiveComponent rendered');
  
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      <button onClick={onUpdate}>Update</button>
    </div>
  );
});

// 自定义比较函数
const CustomMemoComponent = memo(function CustomMemoComponent({ user, settings }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{settings.theme}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // 返回 true 表示 props 相等，不需要重新渲染
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.settings.theme === nextProps.settings.theme
  );
});

// 使用示例
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [data] = useState({ title: 'Title', content: 'Content' });
  
  const handleUpdate = useCallback(() => {
    console.log('Update clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* 即使 count 改变，ExpensiveComponent 也不会重新渲染 */}
      <ExpensiveComponent data={data} onUpdate={handleUpdate} />
    </div>
  );
}
```

### 2. useMemo

缓存计算结果。

```jsx
import React, { useMemo, useState } from 'react';

function ExpensiveList({ items, filter, sortBy }) {
  // 缓存过滤和排序的结果
  const processedItems = useMemo(() => {
    console.log('Processing items...');
    
    let filtered = items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      return 0;
    });
  }, [items, filter, sortBy]); // 只有这些依赖改变时才重新计算

  // 缓存昂贵的计算
  const statistics = useMemo(() => {
    console.log('Calculating statistics...');
    return {
      total: processedItems.length,
      average: processedItems.reduce((sum, item) => sum + item.value, 0) / processedItems.length,
      max: Math.max(...processedItems.map(item => item.value))
    };
  }, [processedItems]);

  return (
    <div>
      <div>
        <p>Total: {statistics.total}</p>
        <p>Average: {statistics.average.toFixed(2)}</p>
        <p>Max: {statistics.max}</p>
      </div>
      <ul>
        {processedItems.map(item => (
          <li key={item.id}>{item.name} - {item.value}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. useCallback

缓存函数引用。

```jsx
import React, { useCallback, useState, memo } from 'react';

// 子组件
const ChildComponent = memo(({ onClick, data }) => {
  console.log('ChildComponent rendered');
  return (
    <div>
      <p>{data}</p>
      <button onClick={onClick}>Click me</button>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 不使用 useCallback - 每次渲染都会创建新函数
  const handleClickBad = () => {
    console.log('Button clicked');
  };

  // 使用 useCallback - 函数引用保持不变
  const handleClickGood = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组，函数永远不会改变

  // 依赖特定值的回调
  const handleClickWithDependency = useCallback(() => {
    console.log('Current count:', count);
  }, [count]); // 只有 count 改变时函数才会重新创建

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type something..."
      />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      
      {/* 使用缓存的函数，避免子组件不必要的重新渲染 */}
      <ChildComponent onClick={handleClickGood} data="Static data" />
      <ChildComponent onClick={handleClickWithDependency} data={`Count: ${count}`} />
    </div>
  );
}
```

## 列表优化

### 1. 虚拟化长列表

```jsx
import { FixedSizeList as List } from 'react-window';

// 列表项组件
const ListItem = ({ index, style, data }) => (
  <div style={style}>
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      {data[index].name} - {data[index].email}
    </div>
  </div>
);

// 虚拟化列表
function VirtualizedList({ items }) {
  return (
    <List
      height={400} // 容器高度
      itemCount={items.length}
      itemSize={60} // 每个项目的高度
      itemData={items}
    >
      {ListItem}
    </List>
  );
}

// 动态高度的虚拟化列表
import { VariableSizeList as VariableList } from 'react-window';

const VariableListItem = ({ index, style, data }) => {
  const item = data[index];
  return (
    <div style={style}>
      <div style={{ padding: '10px' }}>
        <h3>{item.title}</h3>
        <p>{item.content}</p>
      </div>
    </div>
  );
};

function VariableVirtualizedList({ items }) {
  const getItemSize = (index) => {
    // 根据内容动态计算高度
    const item = items[index];
    const baseHeight = 60;
    const contentHeight = item.content.length * 0.5;
    return baseHeight + contentHeight;
  };

  return (
    <VariableList
      height={400}
      itemCount={items.length}
      itemSize={getItemSize}
      itemData={items}
    >
      {VariableListItem}
    </VariableList>
  );
}
```

### 2. 分页和无限滚动

```jsx
import { useState, useEffect, useCallback } from 'react';

function InfiniteScrollList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/items?page=${page}&limit=20`);
      const newItems = await response.json();
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // 初始加载
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
      {loading && <div>Loading...</div>}
      {!hasMore && <div>No more items</div>}
    </div>
  );
}
```

## 状态管理优化

### 1. 状态结构优化

```jsx
// ❌ 不好的状态结构
function BadExample() {
  const [user, setUser] = useState({
    profile: { name: '', email: '' },
    preferences: { theme: 'light', language: 'en' },
    posts: [],
    comments: []
  });

  // 更新用户名会导致整个组件重新渲染
  const updateUserName = (name) => {
    setUser(prev => ({
      ...prev,
      profile: { ...prev.profile, name }
    }));
  };
}

// ✅ 好的状态结构
function GoodExample() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [preferences, setPreferences] = useState({ theme: 'light', language: 'en' });
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  // 只更新相关状态
  const updateUserName = (name) => {
    setProfile(prev => ({ ...prev, name }));
  };
}
```

### 2. 状态提升优化

```jsx
// 使用 Context 避免 prop drilling
const UserContext = createContext();
const ThemeContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 分离不同的 Context，避免不必要的重新渲染
function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

## 代码分割

### 1. 路由级别的代码分割

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 2. 组件级别的代码分割

```jsx
import { lazy, Suspense, useState } from 'react';

// 懒加载重型组件
const HeavyChart = lazy(() => import('./HeavyChart'));
const HeavyTable = lazy(() => import('./HeavyTable'));

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('overview')}>Overview</button>
        <button onClick={() => setActiveTab('chart')}>Chart</button>
        <button onClick={() => setActiveTab('table')}>Table</button>
      </nav>

      <div>
        {activeTab === 'overview' && <div>Overview content</div>}
        
        {activeTab === 'chart' && (
          <Suspense fallback={<div>Loading chart...</div>}>
            <HeavyChart />
          </Suspense>
        )}
        
        {activeTab === 'table' && (
          <Suspense fallback={<div>Loading table...</div>}>
            <HeavyTable />
          </Suspense>
        )}
      </div>
    </div>
  );
}
```

## 图片和资源优化

### 1. 图片懒加载

```jsx
import { useState, useRef, useEffect } from 'react';

function LazyImage({ src, alt, placeholder, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} {...props}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      {!isLoaded && isInView && (
        <div style={{ background: '#f0f0f0', minHeight: '200px' }}>
          {placeholder || 'Loading...'}
        </div>
      )}
    </div>
  );
}
```

### 2. 预加载关键资源

```jsx
import { useEffect } from 'react';

function usePreloadImages(imageUrls) {
  useEffect(() => {
    const preloadImage = (url) => {
      const img = new Image();
      img.src = url;
    };

    imageUrls.forEach(preloadImage);
  }, [imageUrls]);
}

function Gallery() {
  const imageUrls = [
    '/images/hero1.jpg',
    '/images/hero2.jpg',
    '/images/hero3.jpg'
  ];

  usePreloadImages(imageUrls);

  return (
    <div>
      {imageUrls.map((url, index) => (
        <img key={index} src={url} alt={`Hero ${index + 1}`} />
      ))}
    </div>
  );
}
```

## 性能监控

### 1. 自定义性能监控

```jsx
import { useEffect } from 'react';

function usePerformanceMonitor(componentName) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // 超过一帧的时间
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}

function MyComponent() {
  usePerformanceMonitor('MyComponent');
  
  // 组件逻辑
  return <div>My Component</div>;
}
```

### 2. 内存泄漏检测

```jsx
import { useEffect, useRef } from 'react';

function useMemoryLeakDetection(componentName) {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const unmountTime = Date.now();
      const lifeTime = unmountTime - mountTime.current;
      
      // 检查是否有未清理的定时器、事件监听器等
      console.log(`${componentName} lived for ${lifeTime}ms`);
    };
  }, [componentName]);
}
```

## 最佳实践总结

1. **使用 React DevTools Profiler** 识别性能瓶颈
2. **合理使用 memo、useMemo、useCallback** 避免不必要的重新渲染
3. **优化状态结构** 避免深层嵌套和不必要的状态更新
4. **实现虚拟化** 处理大量数据的列表
5. **代码分割** 减少初始包大小
6. **图片优化** 使用懒加载和适当的格式
7. **避免内联对象和函数** 在 JSX 中
8. **使用 key 属性** 帮助 React 识别列表项的变化
9. **监控性能指标** 持续优化应用性能

## 学习资源

- [React 性能优化官方文档](https://reactjs.org/docs/optimizing-performance.html)
- [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- [Web Vitals](https://web.dev/vitals/)

## 下一步

- 学习 [React 测试](./testing.md)
- 了解 [状态管理库](./state-management.md)
- 探索 [React 18 新特性](./react18.md)
