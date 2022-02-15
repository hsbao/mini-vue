import { initState } from './state'

import { compileToFunction } from './compiler/index.js'

// 在Vue的原型上扩展一个init方法 
export function initMixin(Vue) {
	// 初始化流程
  Vue.prototype._init = function (options) {
    let vm = this
    vm.$options = options || {} // vue中使用this.$options指代的就是用户传的属性

		// 1. 初始化状态
		initState(vm)

    // 2. 如果传入el属性，需要实现挂载流程，把页面渲染出来
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function(el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)

    /**
     * 1. 默认会先查找render方法
     * 2. 如果没有render方法，会查找是否有传入template
     * 3. 如果没有传入template，就用el中的内容
     * 4. 需要将得到的template编译成render方法
     */
    if (!options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      const render = compileToFunction(template)
      options.render = render
    }
  }
}
