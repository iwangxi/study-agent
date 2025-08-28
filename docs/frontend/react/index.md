# React 学习指南

## 概述

React 是由 Facebook 开发的用于构建用户界面的 JavaScript 库。它采用组件化的开发方式，使得构建复杂的 UI 变得更加简单和高效。

## 核心概念

### 1. 组件 (Components)

React 应用由组件构成，组件是可复用的 UI 片段。

#### 函数组件
```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 使用 Arrow Function
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};
```

#### 类组件
```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

### 2. JSX 语法

JSX 是 JavaScript 的语法扩展，允许在 JavaScript 中编写类似 HTML 的代码。

```jsx
const element = <h1>Hello, world!</h1>;

// JSX 中使用表达式
const name = 'Josh Perez';
const element = <h1>Hello, {name}</h1>;

// JSX 属性
const element = <div tabIndex="0"></div>;
const element = <img src={user.avatarUrl}></img>;
```

### 3. Props（属性）

Props 是组件的输入，用于从父组件向子组件传递数据。

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}
```

### 4. State（状态）

State 是组件内部的数据，当 state 发生变化时，组件会重新渲染。

#### 使用 useState Hook
```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### 类组件中的 State
```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```

## React Hooks

### 1. useState
管理组件的状态。

```jsx
const [state, setState] = useState(initialState);
```

### 2. useEffect
处理副作用，如数据获取、订阅或手动更改 DOM。

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  // 只在组件挂载时执行
  useEffect(() => {
    fetchData();
  }, []); // 空依赖数组

  // 依赖特定值
  useEffect(() => {
    updateSomething();
  }, [count]); // 只有 count 改变时才执行

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### 3. useContext
使用 Context 在组件树中传递数据。

```jsx
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button theme={theme}>I am styled by theme context!</button>;
}
```

### 4. useReducer
管理复杂的状态逻辑。

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

## 事件处理

```jsx
function Button() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}
```

## 条件渲染

```jsx
function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
}

// 使用三元运算符
function LoginButton(props) {
  return (
    <div>
      {props.isLoggedIn ? (
        <LogoutButton onClick={props.onClick} />
      ) : (
        <LoginButton onClick={props.onClick} />
      )}
    </div>
  );
}

// 使用 && 运算符
function Mailbox(props) {
  const unreadMessages = props.unreadMessages;
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 &&
        <h2>
          You have {unreadMessages.length} unread messages.
        </h2>
      }
    </div>
  );
}
```

## 列表渲染

```jsx
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

// 更简洁的写法
function NumberList(props) {
  const numbers = props.numbers;
  return (
    <ul>
      {numbers.map((number) =>
        <li key={number.toString()}>
          {number}
        </li>
      )}
    </ul>
  );
}
```

## 表单处理

### 受控组件
```jsx
function NameForm() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event) => {
    alert('A name was submitted: ' + value);
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={value} onChange={handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
```

### 非受控组件
```jsx
function NameForm() {
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    alert('A name was submitted: ' + inputRef.current.value);
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" ref={inputRef} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
```

## 组件生命周期

### 函数组件中的生命周期（使用 useEffect）
```jsx
function MyComponent() {
  useEffect(() => {
    // 组件挂载后执行（componentDidMount）
    console.log('Component mounted');
    
    return () => {
      // 组件卸载前执行（componentWillUnmount）
      console.log('Component will unmount');
    };
  }, []);

  useEffect(() => {
    // 每次渲染后执行（componentDidUpdate）
    console.log('Component updated');
  });

  return <div>My Component</div>;
}
```

## 最佳实践

1. **使用函数组件和 Hooks**：现代 React 开发推荐使用函数组件
2. **保持组件纯净**：避免在组件中直接修改 props
3. **合理使用 key**：在列表渲染中使用唯一的 key
4. **状态提升**：将共享状态提升到最近的共同父组件
5. **组件拆分**：保持组件小而专注
6. **使用 PropTypes 或 TypeScript**：进行类型检查

## 学习资源

- [React 官方文档](https://reactjs.org/)
- [React 中文文档](https://zh-hans.reactjs.org/)
- [React Hooks 详解](./hooks.md)
- [React 性能优化](./performance.md)
- [React 测试](./testing.md)

## 下一步

- 学习 [React Hooks 进阶](./hooks.md)
- 了解 [React 性能优化](./performance.md)
- 探索 [Next.js 框架](../nextjs/index.md)
