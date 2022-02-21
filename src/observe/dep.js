let id = 0
export class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  depend() {
    /**
     * 此时的Dep.target就是watcher，watcher上有addDep方法
     * this则是当前的dep实例
     * 把dep传到watcher的addDep方法中
     * 让这个watch记住当前的dep
     */
    Dep.target.addDep(this)
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update())
  }
}

let stack = []
export function pushTarget(watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep
