import { initState } from './state'

import { compileToFunction } from './compiler/index.js'
import { mountComponent, callHook } from './lifecycle'

import { mergeOptions } from './utils/index'

import nextTick from './utils/next-tick'

// 在Vue的原型上扩展一个init方法 
export function initMixin(Vue) {
	// 初始化流程
  Vue.prototype._init = function (options) {
    let vm = this
    // 将用户传递的和全局的进行一个合并 
    vm.$options = mergeOptions(vm.constructor.options, options)

    console.log(vm.$options)

    callHook(vm, 'beforeCreate')

		// 1. 初始化状态
		initState(vm)

    callHook(vm, 'created')

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

    // 5. 得到render方法后，然后渲染组件
    mountComponent(vm, el)
  }

  Vue.prototype.$nextTick = nextTick
}
