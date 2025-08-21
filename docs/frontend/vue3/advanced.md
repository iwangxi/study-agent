# Vue3 高级特性

## 🎯 学习目标

通过本章节的学习，你将掌握：
- Vue3 的高级组件模式
- 自定义指令的开发和使用
- 插件系统的设计和实现
- 性能优化的技巧和策略

## 🧩 高级组件模式

### 高阶组件 (HOC)

```typescript
// 高阶组件示例
import { defineComponent, h } from 'vue'

function withLoading<T extends Record<string, any>>(
  WrappedComponent: T,
  loadingText = '加载中...'
) {
  return defineComponent({
    name: `WithLoading(${WrappedComponent.name})`,
    props: {
      loading: {
        type: Boolean,
        default: false
      }
    },
    setup(props, { slots, attrs }) {
      return () => {
        if (props.loading) {
          return h('div', { class: 'loading' }, loadingText)
        }
        return h(WrappedComponent, attrs, slots)
      }
    }
  })
}

// 使用高阶组件
const UserListWithLoading = withLoading(UserList, '用户列表加载中...')
```

### 渲染函数和 JSX

```typescript
// 使用渲染函数
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  name: 'DynamicList',
  props: {
    items: Array,
    renderItem: Function
  },
  setup(props) {
    const selectedId = ref(null)

    return () => {
      return h('div', { class: 'dynamic-list' }, [
        h('h3', '动态列表'),
        props.items?.map(item => 
          h('div', {
            key: item.id,
            class: {
              'list-item': true,
              'selected': selectedId.value === item.id
            },
            onClick: () => selectedId.value = item.id
          }, [
            props.renderItem ? props.renderItem(item) : item.name
          ])
        )
      ])
    }
  }
})
```

```tsx
// 使用 JSX (需要配置 @vitejs/plugin-vue-jsx)
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'TodoList',
  setup() {
    const todos = ref([
      { id: 1, text: '学习 Vue3', completed: false },
      { id: 2, text: '写项目文档', completed: true }
    ])

    const toggleTodo = (id: number) => {
      const todo = todos.value.find(t => t.id === id)
      if (todo) todo.completed = !todo.completed
    }

    return () => (
      <div class="todo-list">
        <h3>待办事项</h3>
        {todos.value.map(todo => (
          <div
            key={todo.id}
            class={['todo-item', { completed: todo.completed }]}
            onClick={() => toggleTodo(todo.id)}
          >
            <span>{todo.text}</span>
            {todo.completed && <span class="check">✓</span>}
          </div>
        ))}
      </div>
    )
  }
})
```

### 函数式组件

```typescript
// 函数式组件
import { FunctionalComponent } from 'vue'

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const Button: FunctionalComponent<ButtonProps> = (props, { slots, emit }) => {
  const handleClick = (event: Event) => {
    if (!props.disabled) {
      emit('click', event)
    }
  }

  return (
    <button
      class={[
        'btn',
        `btn--${props.type || 'primary'}`,
        `btn--${props.size || 'medium'}`,
        { 'btn--disabled': props.disabled }
      ]}
      disabled={props.disabled}
      onClick={handleClick}
    >
      {slots.default?.()}
    </button>
  )
}

Button.props = ['type', 'size', 'disabled']
Button.emits = ['click']

export default Button
```

## 🎨 自定义指令

### 基础自定义指令

```typescript
// 自动聚焦指令
const vFocus = {
  mounted(el: HTMLElement) {
    el.focus()
  }
}

// 点击外部指令
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutsideHandler = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutsideHandler)
    delete el._clickOutsideHandler
  }
}

// 使用指令
export default defineComponent({
  directives: {
    focus: vFocus,
    clickOutside: vClickOutside
  },
  setup() {
    const showDropdown = ref(false)
    
    const closeDropdown = () => {
      showDropdown.value = false
    }

    return {
      showDropdown,
      closeDropdown
    }
  },
  template: `
    <div>
      <input v-focus placeholder="自动聚焦" />
      <div v-click-outside="closeDropdown" class="dropdown">
        <button @click="showDropdown = !showDropdown">
          下拉菜单
        </button>
        <ul v-show="showDropdown">
          <li>选项 1</li>
          <li>选项 2</li>
        </ul>
      </div>
    </div>
  `
})
```

### 高级自定义指令

```typescript
// 懒加载指令
interface LazyLoadingOptions {
  placeholder?: string
  error?: string
  threshold?: number
}

const vLazyLoad = {
  mounted(el: HTMLImageElement, binding: any) {
    const options: LazyLoadingOptions = binding.value || {}
    
    // 设置占位图
    if (options.placeholder) {
      el.src = options.placeholder
    }
    
    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const realSrc = img.dataset.src
            
            if (realSrc) {
              // 预加载图片
              const tempImg = new Image()
              tempImg.onload = () => {
                img.src = realSrc
                img.classList.add('loaded')
              }
              tempImg.onerror = () => {
                if (options.error) {
                  img.src = options.error
                }
                img.classList.add('error')
              }
              tempImg.src = realSrc
            }
            
            observer.unobserve(img)
          }
        })
      },
      {
        threshold: options.threshold || 0.1
      }
    )
    
    observer.observe(el)
    el._lazyLoadObserver = observer
  },
  
  unmounted(el: HTMLImageElement) {
    if (el._lazyLoadObserver) {
      el._lazyLoadObserver.disconnect()
      delete el._lazyLoadObserver
    }
  }
}

// 权限控制指令
const vPermission = {
  mounted(el: HTMLElement, binding: any) {
    const { value: permission } = binding
    const userPermissions = getCurrentUserPermissions() // 获取用户权限
    
    if (!userPermissions.includes(permission)) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement, binding: any) {
    const { value: permission } = binding
    const userPermissions = getCurrentUserPermissions()
    
    if (userPermissions.includes(permission)) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  }
}
```

## 🔌 插件系统

### 基础插件开发

```typescript
// 插件定义
import { App } from 'vue'

interface ToastOptions {
  duration?: number
  position?: 'top' | 'center' | 'bottom'
  type?: 'success' | 'error' | 'warning' | 'info'
}

interface ToastInstance {
  show(message: string, options?: ToastOptions): void
  success(message: string, options?: ToastOptions): void
  error(message: string, options?: ToastOptions): void
  warning(message: string, options?: ToastOptions): void
  info(message: string, options?: ToastOptions): void
}

class Toast implements ToastInstance {
  private container: HTMLElement

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'toast-container'
    document.body.appendChild(this.container)
  }

  show(message: string, options: ToastOptions = {}) {
    const {
      duration = 3000,
      position = 'top',
      type = 'info'
    } = options

    const toast = document.createElement('div')
    toast.className = `toast toast--${type} toast--${position}`
    toast.textContent = message

    this.container.appendChild(toast)

    // 动画显示
    setTimeout(() => toast.classList.add('toast--show'), 10)

    // 自动移除
    setTimeout(() => {
      toast.classList.remove('toast--show')
      setTimeout(() => {
        if (toast.parentNode) {
          this.container.removeChild(toast)
        }
      }, 300)
    }, duration)
  }

  success(message: string, options?: ToastOptions) {
    this.show(message, { ...options, type: 'success' })
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, { ...options, type: 'error' })
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, { ...options, type: 'warning' })
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, { ...options, type: 'info' })
  }
}

// 插件安装函数
export default {
  install(app: App, options: ToastOptions = {}) {
    const toast = new Toast()
    
    // 全局属性
    app.config.globalProperties.$toast = toast
    
    // 组合式 API
    app.provide('toast', toast)
  }
}

// 类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: ToastInstance
  }
}
```

### 高级插件模式

```typescript
// 状态管理插件
import { App, reactive, readonly } from 'vue'

interface StoreOptions<T> {
  state: T
  mutations?: Record<string, (state: T, payload?: any) => void>
  actions?: Record<string, (context: StoreContext<T>, payload?: any) => any>
  getters?: Record<string, (state: T) => any>
}

interface StoreContext<T> {
  state: T
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => any
}

class SimpleStore<T> {
  private _state: T
  private _mutations: Record<string, Function>
  private _actions: Record<string, Function>
  private _getters: Record<string, Function>

  constructor(options: StoreOptions<T>) {
    this._state = reactive(options.state)
    this._mutations = options.mutations || {}
    this._actions = options.actions || {}
    this._getters = options.getters || {}
  }

  get state() {
    return readonly(this._state)
  }

  commit(mutation: string, payload?: any) {
    const mutationFn = this._mutations[mutation]
    if (mutationFn) {
      mutationFn(this._state, payload)
    } else {
      console.warn(`Mutation ${mutation} not found`)
    }
  }

  dispatch(action: string, payload?: any) {
    const actionFn = this._actions[action]
    if (actionFn) {
      const context: StoreContext<T> = {
        state: this._state,
        commit: this.commit.bind(this),
        dispatch: this.dispatch.bind(this)
      }
      return actionFn(context, payload)
    } else {
      console.warn(`Action ${action} not found`)
    }
  }

  getters() {
    const getters: Record<string, any> = {}
    Object.keys(this._getters).forEach(key => {
      Object.defineProperty(getters, key, {
        get: () => this._getters[key](this._state),
        enumerable: true
      })
    })
    return getters
  }
}

// 插件
export default {
  install(app: App) {
    app.config.globalProperties.$createStore = <T>(options: StoreOptions<T>) => {
      return new SimpleStore(options)
    }
  }
}
```

## ⚡ 性能优化

### 组件优化

```typescript
// 使用 defineAsyncComponent 进行组件懒加载
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// 使用 Suspense 处理异步组件
export default defineComponent({
  components: {
    AsyncComponent
  },
  template: `
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <div>加载中...</div>
      </template>
    </Suspense>
  `
})
```

### 虚拟滚动

```typescript
// 虚拟滚动组件
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'VirtualList',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    containerHeight: {
      type: Number,
      default: 400
    }
  },
  setup(props, { slots }) {
    const scrollTop = ref(0)
    const containerRef = ref<HTMLElement>()

    // 计算可见范围
    const visibleRange = computed(() => {
      const start = Math.floor(scrollTop.value / props.itemHeight)
      const end = Math.min(
        start + Math.ceil(props.containerHeight / props.itemHeight) + 1,
        props.items.length
      )
      return { start, end }
    })

    // 可见项目
    const visibleItems = computed(() => {
      const { start, end } = visibleRange.value
      return props.items.slice(start, end).map((item, index) => ({
        item,
        index: start + index
      }))
    })

    // 总高度
    const totalHeight = computed(() => props.items.length * props.itemHeight)

    // 偏移量
    const offsetY = computed(() => visibleRange.value.start * props.itemHeight)

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement
      scrollTop.value = target.scrollTop
    }

    onMounted(() => {
      containerRef.value?.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      containerRef.value?.removeEventListener('scroll', handleScroll)
    })

    return () => (
      <div
        ref={containerRef}
        class="virtual-list"
        style={{
          height: `${props.containerHeight}px`,
          overflow: 'auto'
        }}
      >
        <div style={{ height: `${totalHeight.value}px`, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY.value}px)`
            }}
          >
            {visibleItems.value.map(({ item, index }) => (
              <div
                key={index}
                style={{
                  height: `${props.itemHeight}px`,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {slots.default?.({ item, index })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
})
```

### 内存优化

```typescript
// 使用 WeakMap 避免内存泄漏
const componentCache = new WeakMap()

export function useComponentCache<T>(component: T): T {
  if (componentCache.has(component)) {
    return componentCache.get(component)
  }
  
  const cachedComponent = { ...component }
  componentCache.set(component, cachedComponent)
  return cachedComponent
}

// 清理定时器和事件监听器
export default defineComponent({
  setup() {
    const timers: number[] = []
    const listeners: Array<() => void> = []

    const addTimer = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay)
      timers.push(timer)
      return timer
    }

    const addListener = (element: HTMLElement, event: string, handler: EventListener) => {
      element.addEventListener(event, handler)
      listeners.push(() => element.removeEventListener(event, handler))
    }

    onUnmounted(() => {
      // 清理定时器
      timers.forEach(timer => clearTimeout(timer))
      
      // 清理事件监听器
      listeners.forEach(cleanup => cleanup())
    })

    return {
      addTimer,
      addListener
    }
  }
})
```

## 🧪 测试高级组件

```typescript
// 测试自定义指令
import { mount } from '@vue/test-utils'
import { vClickOutside } from '@/directives/clickOutside'

describe('v-click-outside directive', () => {
  it('should call handler when clicking outside', async () => {
    const handler = vi.fn()
    
    const wrapper = mount({
      directives: { clickOutside: vClickOutside },
      template: '<div v-click-outside="handler">Content</div>',
      setup() {
        return { handler }
      }
    })

    // 模拟点击外部
    document.body.click()
    
    expect(handler).toHaveBeenCalled()
  })
})

// 测试插件
import { createApp } from 'vue'
import ToastPlugin from '@/plugins/toast'

describe('Toast Plugin', () => {
  it('should install plugin correctly', () => {
    const app = createApp({})
    app.use(ToastPlugin)
    
    expect(app.config.globalProperties.$toast).toBeDefined()
  })
})
```

## 📖 学习资源

### 官方文档
- [Vue3 高级指南](https://vuejs.org/guide/extras/)
- [自定义指令](https://vuejs.org/guide/reusability/custom-directives.html)
- [插件开发](https://vuejs.org/guide/reusability/plugins.html)

### 进阶资源
- [Vue3 源码解析](https://vue3js.cn/vue-analysis/)
- [性能优化指南](https://vuejs.org/guide/best-practices/performance.html)

---

🎉 **恭喜！** 你已经掌握了Vue3的高级特性。这些技能将帮助你构建更加复杂和高性能的应用程序。
