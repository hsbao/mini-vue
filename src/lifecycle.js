import Watcher from './observe/watcher'
import { patch } from './vdom/patch'

/**
 * 在Vue构造函数上扩展一个_update方法，通过传入的虚拟DOM创建真实DOM
 * @param {*} Vue 
 */
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function(vnode) {
    const vm = this
    vm.$el = patch(vm.$el, vnode) // 用虚拟dom创建真实dom，并替换掉之前的真实dom
  }
}

export function mountComponent(vm, el) {
  const options = vm.$options // 此时vm.$options上已经有render方法了
  vm.$el = el // 把真实dom也存下来

  /**
   * Watcher就是用来渲染的
   * vm._render：就是调用模板编译得到的render方法，得到虚拟DOM
   * vm._update：通过虚拟DOM，创建真实DOM
   */

  // 渲染页面：无论是首次渲染还是更新，都要调用这个方法
  const updateComponent = () => {
    const vnode = vm._render()
    vm._update(vnode)
  }

  /**
   * 渲染watcher，每一个组件都会有一个渲染Watcher，用来调用updateComponent
   * true 表示是一个渲染Watcher
   */
  new Watcher(vm, updateComponent, () => {}, true)
}