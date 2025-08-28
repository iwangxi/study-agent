# React Hooks 进阶指南

## 概述

React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## 内置 Hooks 详解

### 1. useState

管理组件的局部状态。

```jsx
import React, { useState } from 'react';

// 基础用法
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(prev => prev - 1)}>-</button>
    </div>
  );
}

// 对象状态
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  const updateUser = (field, value) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form>
      <input 
        value={user.name}
        onChange={(e) => updateUser('name', e.target.value)}
        placeholder="Name"
      />
      <input 
        value={user.email}
        onChange={(e) => updateUser('email', e.target.value)}
        placeholder="Email"
      />
    </form>
  );
}
```

### 2. useEffect

处理副作用操作。

```jsx
import React, { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        const result = await response.json();
        
        if (!isCancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // 清理函数
    return () => {
      isCancelled = true;
    };
  }, []); // 空依赖数组，只在挂载时执行

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Data: {JSON.stringify(data)}</div>;
}

// 监听特定值的变化
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      searchAPI(query).then(setResults);
    } else {
      setResults([]);
    }
  }, [query]); // 只有 query 改变时才重新执行

  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### 3. useContext

使用 Context 进行状态管理。

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建 Context
const ThemeContext = createContext();
const UserContext = createContext();

// Provider 组件
function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 自定义 Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 使用 Context
function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  return (
    <header className={`header-${theme}`}>
      <h1>Welcome, {user?.name || 'Guest'}</h1>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}
```

### 4. useReducer

管理复杂的状态逻辑。

```jsx
import React, { useReducer } from 'react';

// 定义 reducer
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  todos: [],
  filter: 'all'
};

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_TODO', payload: inputValue });
      setInputValue('');
    }
  };

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'completed') return todo.completed;
    if (state.filter === 'active') return !todo.completed;
    return true;
  });

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add Todo</button>
      
      <div>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}>
          All
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}>
          Active
        </button>
        <button onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}>
          Completed
        </button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. useMemo

缓存计算结果，优化性能。

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveComponent({ items, filter }) {
  const [count, setCount] = useState(0);

  // 缓存昂贵的计算
  const filteredItems = useMemo(() => {
    console.log('Filtering items...'); // 只有在 items 或 filter 改变时才会执行
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  const expensiveValue = useMemo(() => {
    console.log('Calculating expensive value...');
    return filteredItems.reduce((sum, item) => sum + item.price, 0);
  }, [filteredItems]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Total Price: ${expensiveValue}</p>
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name} - ${item.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 6. useCallback

缓存函数，避免不必要的重新渲染。

```jsx
import React, { useState, useCallback, memo } from 'react';

// 子组件使用 memo 优化
const ChildComponent = memo(({ onClick, name }) => {
  console.log(`Rendering ${name}`);
  return <button onClick={onClick}>{name}</button>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 使用 useCallback 缓存函数
  const handleClick1 = useCallback(() => {
    console.log('Button 1 clicked');
  }, []); // 没有依赖，函数永远不会改变

  const handleClick2 = useCallback(() => {
    console.log('Current count:', count);
  }, [count]); // 依赖 count，只有 count 改变时函数才会重新创建

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type something..."
      />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      <ChildComponent onClick={handleClick1} name="Button 1" />
      <ChildComponent onClick={handleClick2} name="Button 2" />
    </div>
  );
}
```

### 7. useRef

访问 DOM 元素或保存可变值。

```jsx
import React, { useRef, useEffect, useState } from 'react';

function FocusInput() {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    // 组件挂载后自动聚焦
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    // 每次渲染时增加计数，但不触发重新渲染
    countRef.current += 1;
  });

  const handleClick = () => {
    inputRef.current.focus();
    alert(`Input value: ${inputRef.current.value}`);
    alert(`Component has rendered ${countRef.current} times`);
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Focus and Alert</button>
      <button onClick={() => setRenderCount(renderCount + 1)}>
        Force Re-render ({renderCount})
      </button>
    </div>
  );
}
```

## 自定义 Hooks

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

### 1. useLocalStorage

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 从 localStorage 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回一个包装过的 setter 函数
  const setValue = (value) => {
    try {
      // 允许 value 是一个函数，这样我们就有了与 useState 相同的 API
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// 使用示例
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'en');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
```

### 2. useFetch

```jsx
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3. useDebounce

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      searchAPI(debouncedSearchTerm).then(setResults);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Hook 使用规则

1. **只在最顶层使用 Hook**：不要在循环、条件或嵌套函数中调用 Hook
2. **只在 React 函数中调用 Hook**：不要在普通的 JavaScript 函数中调用 Hook
3. **使用 ESLint 插件**：使用 `eslint-plugin-react-hooks` 来强制执行这些规则

## 最佳实践

1. **合理使用依赖数组**：确保 useEffect、useMemo、useCallback 的依赖数组包含所有使用的变量
2. **避免过度优化**：不要过度使用 useMemo 和 useCallback
3. **自定义 Hook 的命名**：以 "use" 开头
4. **状态的合理拆分**：相关的状态可以放在一起，不相关的状态应该分开
5. **清理副作用**：在 useEffect 中返回清理函数

## 学习资源

- [React Hooks 官方文档](https://reactjs.org/docs/hooks-intro.html)
- [React Hooks FAQ](https://reactjs.org/docs/hooks-faq.html)
- [自定义 Hook 示例](https://usehooks.com/)

## 下一步

- 学习 [React 性能优化](./performance.md)
- 了解 [React 测试](./testing.md)
- 探索 [状态管理库](./state-management.md)
