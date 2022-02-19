import { mergeOptions } from '../utils/index'

export function initGlobalAPI(Vue) {
  Vue.options = {}

  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
  }

  Vue.options._base = Vue // 记录下Vue，这样无论创建多少个子类，都能通过_base找到Vue

  // 全局组件也是放在Vue.options的
  Vue.options.components = {}

  /**
   * Vue.component('my-button', {
   *   name: 'el-button', // 组件命令的时候，这里的优先级比my-button高
   *   template: '<button>全局组件</button>',
   *   data() { return {...} }
   * })
   * @param {*} id 组件的名称
   * @param {*} definition 组件的信息
   */
  Vue.component = function (id, definition) {
    // 为了组件直接相互隔离，每个组件都要产生一个继承于Vue的子类
    // 这里其实就是通过extend得到了一个继承于Vue的子类
    const newDefinition = Vue.options._base.extend(definition)
    const componentName = definition.name || id
    this.options.components[componentName] = newDefinition
  }

  /**
   *
   * @param {*} options
   * @returns
   *
   * var Profile = Vue.extend({
   *     template: '<p>{{msg}}</p>',
   *     data: function () {
   *       return {
   *         msg: 'Walter',
   *       }
   *     }
   *   })
   *  new Profile().$mount('#mount-point')
   */
  Vue.extend = function (options) {
    const Super = this
    const Sub = function VueComponent(options) {
      // 因为是继承于Vue的，所以有init，会走一遍渲染的流程
      // 初始化的使用需要的那些参数，都通过Sub.options = mergeOptions(Super.options, options)合并好了
      this._init(options)
    }
    // 原型链继承
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Super.options, options)

    return Sub
  }
}
