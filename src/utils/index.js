/**
 * 判断是否是对象
 * @param {*} obj
 * @returns
 */
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false, // 是否可以枚举
    configurable: false, // 是否可以修改
    value,
  })
}

// 取值时实现代理效果
export function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    },
  })
}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
]

let strats = {}

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook
})

// 针对全局组件和局部组件的合并
strats.components = function (globalComponent, childComponent) {
  // Vue.options.components放置了全局组件
  let options = Object.create(globalComponent) // options.__proto__ = globalComponent

  // 这样的话，如果声明了同名的组件，先在当前找，找不到了会通过__proto__去到Vue.options.components找
  if (childComponent) {
    for (let key in childComponent) {
      options[key] = childComponent[key]
    }
  }
  return options
}

export function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      //  如果已经合并过了就不需要再次合并了
      mergeField(key)
    }
  }
  // 默认的合并策略,但是有些属性,需要有特殊的合并方式(生命周期的合并)
  function mergeField(key) {
    if (strats[key]) {
      return (options[key] = strats[key](parent[key], child[key]))
    }
    if (typeof parent[key] === 'object' && typeof child[key] === 'object') {
      options[key] = {
        ...parent[key],
        ...child[key],
      }
    } else if (child[key] == null) {
      options[key] = parent[key]
    } else {
      options[key] = child[key] || parent[key]
    }
  }
  return options
}

// 判断是否是原生标签
export function isReservedTag(tagName) {
  const reservedTag = 'a,div,p,button,span,b,i,ul,ol,li,img'
  return reservedTag.includes(tagName)
}
