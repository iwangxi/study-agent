# React 状态管理指南

## 概述

状态管理是 React 应用开发中的核心概念。随着应用复杂度的增加，选择合适的状态管理方案变得至关重要。本指南将介绍各种状态管理解决方案及其适用场景。

## 状态管理层次

### 1. 组件内部状态 (Local State)

适用于简单的、组件特有的状态。

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

### 2. 状态提升 (Lifting State Up)

当多个组件需要共享状态时，将状态提升到最近的共同父组件。

```jsx
function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <Header user={user} />
      <Main user={user} onUserUpdate={setUser} />
      <Footer user={user} />
    </div>
  );
}
```

### 3. Context API

适用于中等复杂度的应用，避免 prop drilling。

```jsx
import { createContext, useContext, useReducer } from 'react';

// 创建 Context
const AppContext = createContext();

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    default:
      return state;
  }
};

// Provider 组件
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    notifications: []
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义 Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// 使用示例
function UserProfile() {
  const { state, dispatch } = useAppContext();

  const updateUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  return (
    <div>
      <h1>Welcome, {state.user?.name || 'Guest'}</h1>
      <button onClick={() => updateUser({ name: 'John Doe' })}>
        Set User
      </button>
    </div>
  );
}
```

## Redux Toolkit

现代 Redux 的推荐方式，简化了 Redux 的使用。

### 1. 安装和配置

```bash
npm install @reduxjs/toolkit react-redux
```

```jsx
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterSlice from './counterSlice';
import userSlice from './userSlice';

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    user: userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. 创建 Slice

```jsx
// store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    history: []
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.history.push(`Incremented to ${state.value}`);
    },
    decrement: (state) => {
      state.value -= 1;
      state.history.push(`Decremented to ${state.value}`);
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push(`Added ${action.payload}, now ${state.value}`);
    },
    reset: (state) => {
      state.value = 0;
      state.history = ['Reset to 0'];
    }
  }
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

### 3. 异步操作 (Thunks)

```jsx
// store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步 thunk
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {
    clearUser: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### 4. 在组件中使用

```jsx
// App.js
import { Provider } from 'react-redux';
import { store } from './store';
import Counter from './Counter';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

// Counter.js
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount, reset } from './store/counterSlice';
import { fetchUser } from './store/userSlice';

function Counter() {
  const count = useSelector(state => state.counter.value);
  const history = useSelector(state => state.counter.history);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
      
      <div>
        <h3>History:</h3>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>

      <div>
        <button onClick={() => dispatch(fetchUser(1))}>
          Fetch User
        </button>
        {user.loading && <p>Loading...</p>}
        {user.error && <p>Error: {user.error}</p>}
        {user.data && <p>User: {user.data.name}</p>}
      </div>
    </div>
  );
}
```

## Zustand

轻量级的状态管理库，API 简单直观。

### 1. 基础用法

```bash
npm install zustand
```

```jsx
import { create } from 'zustand';

// 创建 store
const useCounterStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
  reset: () => set({ count: 0 }),
  // 计算属性
  get doubleCount() {
    return get().count * 2;
  }
}));

// 在组件中使用
function Counter() {
  const { count, increment, decrement, reset, doubleCount } = useCounterStore();

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 2. 异步操作

```jsx
const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData }
    }));
  },
  
  clearUser: () => set({ user: null, error: null })
}));
```

### 3. 持久化

```jsx
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'settings-storage', // localStorage key
      getStorage: () => localStorage, // 可以使用 sessionStorage
    }
  )
);
```

## Jotai

原子化状态管理，适合复杂的状态依赖关系。

### 1. 基础用法

```bash
npm install jotai
```

```jsx
import { atom, useAtom } from 'jotai';

// 定义原子
const countAtom = atom(0);
const nameAtom = atom('');

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [name, setName] = useAtom(nameAtom);

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name"
      />
      <p>Hello, {name}!</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### 2. 派生状态

```jsx
// 基础原子
const firstNameAtom = atom('');
const lastNameAtom = atom('');

// 派生原子（只读）
const fullNameAtom = atom((get) => {
  const firstName = get(firstNameAtom);
  const lastName = get(lastNameAtom);
  return `${firstName} ${lastName}`.trim();
});

// 可写的派生原子
const fullNameWritableAtom = atom(
  (get) => get(fullNameAtom),
  (get, set, newValue) => {
    const [first, last] = newValue.split(' ');
    set(firstNameAtom, first || '');
    set(lastNameAtom, last || '');
  }
);

function NameForm() {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [fullName, setFullName] = useAtom(fullNameWritableAtom);

  return (
    <div>
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)} 
        placeholder="First name"
      />
      <input 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)} 
        placeholder="Last name"
      />
      <p>Full name: {fullName}</p>
      <input 
        value={fullName} 
        onChange={(e) => setFullName(e.target.value)} 
        placeholder="Full name"
      />
    </div>
  );
}
```

### 3. 异步原子

```jsx
const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

function UserProfile() {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [user] = useAtom(userAtom);

  return (
    <div>
      <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
        <option value={1}>User 1</option>
        <option value={2}>User 2</option>
      </select>
      
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </Suspense>
    </div>
  );
}
```

## 选择状态管理方案

### 决策树

```
应用复杂度低？
├─ 是 → 使用 useState + useContext
└─ 否 → 需要时间旅行调试？
    ├─ 是 → Redux Toolkit
    └─ 否 → 团队偏好？
        ├─ 简单 API → Zustand
        ├─ 原子化 → Jotai
        └─ 成熟生态 → Redux Toolkit
```

### 方案对比

| 特性 | useState/Context | Redux Toolkit | Zustand | Jotai |
|------|------------------|---------------|---------|-------|
| 学习曲线 | 低 | 中 | 低 | 中 |
| 包大小 | 0 | 大 | 小 | 小 |
| 开发工具 | 基础 | 优秀 | 基础 | 基础 |
| TypeScript | 好 | 优秀 | 好 | 优秀 |
| 异步处理 | 手动 | 内置 | 简单 | 内置 |
| 持久化 | 手动 | 插件 | 内置 | 插件 |

## 最佳实践

### 1. 状态结构设计

```jsx
// ❌ 避免深层嵌套
const badState = {
  user: {
    profile: {
      personal: {
        name: 'John',
        details: {
          age: 30,
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        }
      }
    }
  }
};

// ✅ 扁平化结构
const goodState = {
  user: { id: 1, name: 'John' },
  userProfile: { userId: 1, age: 30 },
  userAddress: { userId: 1, street: '123 Main St', city: 'New York' }
};
```

### 2. 状态更新模式

```jsx
// ❌ 直接修改状态
const badUpdate = (state, newUser) => {
  state.users.push(newUser); // 直接修改
  return state;
};

// ✅ 不可变更新
const goodUpdate = (state, newUser) => ({
  ...state,
  users: [...state.users, newUser]
});

// 使用 Immer 简化不可变更新
import { produce } from 'immer';

const immerUpdate = produce((draft, newUser) => {
  draft.users.push(newUser);
});
```

### 3. 性能优化

```jsx
// 使用选择器避免不必要的重新渲染
const useUserName = () => useSelector(state => state.user.name);
const useUserEmail = () => useSelector(state => state.user.email);

// 而不是
const useUser = () => useSelector(state => state.user); // 整个 user 对象改变都会重新渲染
```

## 学习资源

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Jotai 官方文档](https://jotai.org/)
- [React Context 官方文档](https://reactjs.org/docs/context.html)

## 下一步

- 学习 [React 测试](./testing.md)
- 了解 [React 18 新特性](./react18.md)
- 探索 [微前端架构](../architecture/micro-frontend.md)
