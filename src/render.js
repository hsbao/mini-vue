import { createElement, createTextNode } from './vdom/create-element'

/**
 * 在Vue构造函数上扩展一个_render方法
 * 通过模板编译得到的render方法，调用后得到VNode
 * 将template转换成ast语法树 --> 生成render方法 --> 调用render方法得到VNode --> 把VNode传给vm._update生成真实的DOM
 * @param {*} Vue
 */
export function renderMixin(Vue) {
  Vue.prototype._c = function () {
    const vm = this
    let args = Array.from(arguments)
    args = [vm, ...args]
    return createElement(...args) // vm, tag, data, children1, children2 ...
  }
  Vue.prototype._v = function (text) {
    const vm = this
    return createTextNode(vm, text)
  }
  Vue.prototype._s = function (val) {
    return val === null
      ? ''
      : typeof val === 'object'
      ? JSON.stringify(val)
      : val
  }

  Vue.prototype._render = function () {
    const vm = this
    const { render } = vm.$options // 模板编译得到的render
    // function render() {
    // 	with (this) {
    // 		return _c("div",{id:app},_c("p",undefined,_v('hello' + _s(name) )),_v('hello'))
    // 	}
    // }
    const vnode = render.call(vm)
    return vnode
  }
}
