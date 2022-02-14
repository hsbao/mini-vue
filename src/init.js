import { initState } from './state'

// 在Vue的原型上扩展一个init方法 
export function initMixin(Vue) {
	// 初始化流程
  Vue.prototype._init = function (options) {
    let vm = this
    vm.$options = options || {} // vue中使用this.$options指代的就是用户传的属性

		// 初始化状态
		initState(vm)
  }
}
