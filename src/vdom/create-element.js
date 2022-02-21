import { isReservedTag, isObject } from '../utils/index'

function vnode(vm, tag, data, key, children, text, componentOptions = {}) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions,
  }
}

// 创建组件的VNode，为了区分自定义组件和其他元素
function createComponent(vm, tag, data, key, children, ConstructorFn) {
  if (isObject(ConstructorFn)) {
    ConstructorFn = vm.$options._base.extend(ConstructorFn) // 如果是一个对象，要转成构造函数
  }

  // 如果是自定义的组件，加上这个
  // 等组件渲染的时候，需要调用这个方法
  // 在patch的createComponent方法中会调用init
  // 这样把vm和vnode.componentInstance绑定
  // 在vm.$mount()后，vm上会有$el，那么vnode.componentInstance也会有$el
  // 这样就可以直接使用$el渲染出自定义组件的DOM
  data.hook = {
    init(vnode) {
      let vm = (vnode.componentInstance = new ConstructorFn({
        _isComponent: true,
      }))
      vm.$mount() // 调用$mount，会走到_update里，这个时候会把创建的真实dom挂载到vm.$el上
      // console.log(vm.$el)
    },
  }
  return vnode(vm, `vue-component-${tag}`, data, key, undefined, undefined, {
    ConstructorFn,
    children,
  })
}

export function createElement(vm, tag, data = {}, ...children) {
  const key = data.key
  if (key) {
    delete data.key
  }
  if (isReservedTag(tag)) {
    return vnode(vm, tag, data, key, children, undefined)
  } else {
    const ConstructorFn = vm.$options.components[tag] // 通过tag名去找到对应的组件
    return createComponent(vm, tag, data, key, children, ConstructorFn)
  }
}

export function createTextNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}
