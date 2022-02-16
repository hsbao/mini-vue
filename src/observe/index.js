import { def, isObject } from '../utils/index'
import { arrayMethods } from './array'
import Dep from './dep'

// 在data中的属性，都要使用Object.defineProperty重新定义
// Object.defineProperty不能兼容ie8，所以vue2无法兼容ie8版本
export function observe(data) {
  const isObj = isObject(data)
  if (!isObj) {
    return
  }
  return new Observer(data)
}

class Observer {
  constructor(value) {
    // vue中的data，如果数据的层次过多，需要递归的去解析数据中的属性，依次增加get和set
    // 这也是性能消耗的地方，所以vue3改为proxy，不用递归

    // value.__ob__ = this 给每个加上__ob__，方便后续使用当前类的方法
    def(value, '__ob__', this)

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods // 重写数组原型上可以修改数组的方法 7 个
      // 数组，如果是数组里面有对象，再继续监测
      this.observerArray(value)
    } else {
      // 对象
      this.walk(value)
    }
  }

  observerArray(value) {
    for (var i = 0; i < value.length; i++) {
      observe(value[i])
    }
  }

  walk(data) {
    const keys = Object.keys(data)
    keys.forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }
}

function defineReactive(data, key, value) {
  const dep = new Dep()

  observe(value) // 递归，依次给每个属性都加上get和set
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.append() // 如果有watcher，那么就存起来，收集依赖
      }
      return value
    },
    set(newValue) {
      if (value === newValue) {
        return
      }
      observe(newValue) // 有可能赋值的时候是一个新的对象，所以也要进行数据劫持
      value = newValue

      // 设置新的值后，触发监听watcher，更新页面
      dep.notify()
    },
  })
}
