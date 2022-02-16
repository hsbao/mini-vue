import { pushTarget, popTarget } from './dep'

let id = 0
class Watcher {
  constructor(vm, exprOrFn, callback, options) {
    this.vm = vm
    this.getter = exprOrFn
    this.callback = callback
    this.options = options
    this.id = id++

    this.depId = new Set()
    this.deps = []

    this.get() // 调用get方法 会让渲染watcher执行
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
    pushTarget(this) // 把watcher存起来
    this.getter() // 调用vm._update(vm._render())
    popTarget() // 删除watcher
  }
  update() {
    this.get()
  }
}

export default Watcher
