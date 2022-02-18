import { pushTarget, popTarget } from './dep'
import queueWatcher from './schedular'

let id = 0
class Watcher {
  constructor(vm, exprOrFn, callback, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.callback = callback
    this.options = options
    this.id = id++

    this.user = !!options.user // true则是用户自己写的watcher

    this.lazy = !!options.lazy // 计算属性的watcher
    this.dirty = options.lazy // 计算属性用的，true表示需要去取值，false表示不取值，使用旧的值

    this.depId = new Set()
    this.deps = []

    /**
     * 渲染watcher传进来的exprOrFn是updateComponent方法，用于更新页面
     * 如果是用户自己写的watcher，那么传进来的exprOrFn是一个字符串(监听的属性)
     * 所以需要判断，是用户watcher的时候，需要转成函数的格式
     */
    if (typeof exprOrFn === 'string') {
      this.getter = function () {
        /**
         * 这里会去vm取值，就会进行依赖收集
         * src/observe/index.js的defineReactive方法里，对每个属性都实例化了一个dep
         * 取值的时候触发get，就会把当前的watcher放添加到这个dep中
         */
        let path = exprOrFn.split('.') // 可能会是监听对象里某个属性userInfo.name --> ['userInfo', 'name']
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj
      }
    } else {
      this.getter = exprOrFn
    }

    /**
     * 针对渲染watcher，调用get方法 会让渲染watcher执行
     * 针对用户watcher，默认进来调用，是为了记住第一次的值
     * 针对计算属性watcher，this.lazy为true，默认实例化watcher的时候不执行getter
     */
    this.value = this.lazy ? undefined : this.get()
  }
  addDep(dep) {
    const id = dep.id
    if (!this.depId.has(id)) {
      this.depId.add(id)
      this.deps.push(dep)
      dep.addSub(this) // 调用dep上的addSub方法，把当前watcher传进去
    }
  }
  get() {
    pushTarget(this) // 把watcher存起来 Dep.target = watcher

    /**
     * 如果是渲染watcher，那么就是调用vm._update(vm._render())更新页面
     * 如果是用户写的watcher，就是调用上面那个改造后的getter，去vm上根据传进来的key取值
     */
    let value = this.getter.call(this.vm) // 调用vm._update(vm._render())

    popTarget() // 删除watcher Dep.target = null

    return value
  }
  update() {
    // 调用dep.notify的时候，会依次执行watcher的update
    // 先存在一个队列中
    // 并且去重，避免重复的watcher，这样多次修改同一个属性，只会触发一次更新
    // 最后异步执行
    if (this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  /**
   * 异步更新的时候会调这个方法
   * 这里如果是用户写的watcher，会再次调用this.getter到vm取值，此时是最新的值
   * 用户watcher实例化的时候，传进来的callback就是监听属性值变化后执行的回调
   * 所以判断如果是用户watcher，执行this.callback(newValue, oldVal)
   */
  run() {
    const newValue = this.get()
    const oldVal = this.value

    this.value = newValue
    if (this.user) {
      this.callback(newValue, oldVal)
    }
  }
  evaluate() {
    this.dirty = false // 取值后变为false
    this.value = this.get() // 这里表示计算属性取值，这里的getter就是用户写computed的时候的get方法
  }

  /**
   * 计算属性watcher：给计算属性里面用到的属性再继续收集渲染watcher
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      /**
       * 此时，Dep.target = 渲染watcher的
       * 要给计算属性getter里面的name，age也把渲染watcher收集起来
       * 这样修改的时候，才能触发页面更新
       */
      this.deps[i].depend()
    }
  }
}

export default Watcher
