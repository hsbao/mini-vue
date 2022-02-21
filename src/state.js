import { observe } from './observe/index'
import Watcher from './observe/watcher'
import Dep from './observe/dep'

import { proxy } from './utils/index'

export function initWatchMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    const vm = this
    options.user = true // 表示是一个用户写的watcher
    /**
     * vm
     * key：watch里监听的属性
     * handler：function (newVal, oldVal) {}
     * options
     */
    new Watcher(vm, key, handler, options)
  }
}

export function initState(vm) {
  const opts = vm.$options
  // vue的数据来源：属性，方法，数据，计算属性，watch
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}

function initProps(vm) {}
function initMethods(vm) {}
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data // data.call(vm) 为了保证在data里面使用的this指向当前实例

  // 为了让用户更好的使用 我希望可以直接vm.xxx
  for (let key in data) {
    proxy(vm, '_data', key)
  }

  // 数据劫持，使用Object.defineProperty()给属性增加get和set方法
  // 也就是MVVM模块，属性改变，得到通知，从而刷新页面（响应式原理）
  observe(data)
}

function initComputed(vm) {
  const computed = vm.$options.computed

  const watcher = (vm._computedWatchers = {})
  for (let key in computed) {
    const userDef = computed[key]
    // 依赖的数据发生变化就要重新取值，所以要取到get
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    /**
     * 每个计算属性上本质上就是一个watcher，也叫computed watcher
     * lazy为true表示默认不执行，取值的时候再执行，也就是computer watcher中调用this.getter的时候
     *
     * watcher[key] = ...  是为了把计算属性和watcher做一个映射，绑定在vm上
     */
    watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true })

    // 还需要将computed的key定义在vm上 --> Object.defineProperty
    defineComputed(vm, key, userDef)
  }
}

function createComputedGetter(key) {
  // 包装了一下，计算属性get取值的时候，调用的是这个方法
  return function computedGetter() {
    // 在initComputed的时候，已经把计算属性key和它对应的watcher进行了映射，并且绑定在了vm的_computedWatchers
    // 所以通过key可以取到对应的watcher
    // 计算属性watcher里面有传进去的getter，在watcher执行getter的时候就可以取到值了
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) {
      watcher.evaluate() // 执行evaluate后，会把计算属性的值赋值给watcher.value，所以直接return watcher.value
    }

    // 在调用getter获取计算属性的值后，如果Dep.target还有值，那么需要继续收集依赖
    // 也就是给计算属性里面依赖的属性收集渲染watcher
    // 这样才能在修改计算属性依赖的属性的时候，触发页面更新
    if (Dep.target) {
      watcher.depend()
    }

    return watcher.value
  }
}

function defineComputed(vm, key, userDef) {
  let sharedProperty = {
    enumerable: true,
    configurable: true,
  }
  if (typeof userDef === 'function') {
    sharedProperty.get = createComputedGetter(key)
    sharedProperty.set = function () {}
  } else {
    sharedProperty.get = createComputedGetter(key)
    sharedProperty.set = userDef.set
  }

  Object.defineProperty(vm, key, sharedProperty)
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (let key in watch) {
    const handler = watch[key]

    /**
     * watch的回调可能是一个数组放了很多不同的方法
     * watch: {
     *   name: [function (newVal, oldVal) {}, function (newVal, oldVal) {}]
     *   age(newVal, oldVal) {}
     * }
     */
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler)
}
