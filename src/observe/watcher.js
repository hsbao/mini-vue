class Watcher {
  constructor(vm, exprOrFn, callback, options) {
    this.vm = vm
    this.getter = exprOrFn
    this.callback = callback
    this.options = options

    this.get(); // 调用get方法 会让渲染watcher执行
  }

  get() {
    this.getter()
  }
}

export default Watcher