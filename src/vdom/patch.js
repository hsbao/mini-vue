/**
 * @param {*} oldVnode 可能是真实dom，也有可能是旧的vnode
 * @param {*} vnode 数据发生变化后，得到的最新的vnode
 */
export function patch(oldVnode, vnode) {
  // 1.判断是更新还是要渲染
  if (!oldVnode) {
    // 通过当前的虚拟节点 创建元素并返回
    return createElm(vnode)
  } else {
    const isRealElement = oldVnode.nodeType
    if (isRealElement) {
      const oldElm = oldVnode // div id="app"
      const parentElm = oldElm.parentNode // body

      let el = createElm(vnode)
      // parentElm.insertBefore(el, oldElm.nextSibling)
      // parentElm.removeChild(oldElm)
      parentElm.replaceChild(el, oldElm)

      // 需要将渲染好的结果返回
      return el
    } else {
      // 新旧vnode的比较：dom-diff

      // 1. 新旧vnode的标签不一样，则用新的vnode创建真实dom，替换掉旧的真实dom
      if (oldVnode.tag !== vnode.tag) {
        // 旧的vnode是已经创建过真实dom了，在createElm方法里，创建好真实dom后
        // 会把创建好的真实dom挂载在当前vnode的el上
        return oldVnode.el.parentNode.replaceChild(
          createElm(vnode),
          oldVnode.el
        )
      }

      // 2. 新旧vnode标签一样，复用复用旧的节点
      let el = (vnode.el = oldVnode.el)

      // 如果两个都是文本节点
      if (vnode.tag === undefined) {
        if (oldVnode.text !== vnode.text) {
          el.textContent = vnode.text
        }
        return
      }

      // 标签如果一样，还有比较属性
      updateProperties(vnode, oldVnode.data)

      const newChildren = vnode.children || []
      const oldChildren = oldVnode.children || []
      if (oldChildren.length && newChildren.length) {
        // 新旧vnode都有子节点
        // vue中采用双指针的方式来对比
        patchChildren(el, oldChildren, newChildren)
      } else if (newChildren.length) {
        // 3. 旧的vnode没有子节点，新的vnode有子节点（用新的vnode的children创建真实dom）
        for (let i = 0; i < newChildren.length; i++) {
          const child = createElm(newChildren[i])
          el.appendChild(child)
        }
      } else if (oldChildren.length) {
        // 4. 旧的vnode有子节点，新的vnode没有子节点（直接删除老节点里的内容）
        el.innerHTML = ''
      }
      return el
    }
  }
  // 递归创建真实节点 替换掉老的节点
}

function isSameVNode(oldVNode, vnode) {
  return vnode.tag === oldVNode.tag && vnode.key === oldVNode.key
}

function patchChildren(parentNode, oldChildren, newChildren) {
  let oldStartIndex = 0
  let oldStartVNode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVNode = oldChildren[oldEndIndex]

  let newStartIndex = 0
  let newStartVNode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVNode = newChildren[newEndIndex]

  // 根据旧的children中的每一项的key和他们的下标做一个映射
  // { A: 0, B: 1 }
  const makeIndexByKey = (children) => {
    return children.reduce((res, current, index) => {
      if (current.key) {
        res[current.key] = index
      }
      return res
    }, {})
  }
  const keysMap = makeIndexByKey(oldChildren)

  // 同时循环新的节点和旧的节点，有一方循环完毕就结束
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 这里匹配不上，说明是在乱序比较的时候，该位置的元素被移动走了，此时这个下标的位置为null
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIndex]
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIndex]
    }

    if (isSameVNode(oldStartVNode, newStartVNode)) {
      // 1. 头头比较，如果是相同的vnode，进行复用，直接调用patch就好了
      // patch里面会复用节点和属性的比较
      patch(oldStartVNode, newStartVNode)
      oldStartVNode = oldChildren[++oldStartIndex] // 旧的开始下标往右移
      newStartVNode = newChildren[++newStartIndex] // 新的开始下标往右移
    } else if (isSameVNode(oldEndVNode, newEndVNode)) {
      // 2. 结尾和结尾比较
      patch(oldEndVNode, newEndVNode)
      oldEndVNode = oldChildren[--oldEndIndex] // 旧的结尾下标往左移
      newEndVNode = newChildren[--newEndIndex] // 新的结尾下标往左移
    } else if (isSameVNode(oldStartVNode, newEndVNode)) {
      // 3. 旧的开始和新的结尾比较
      patch(oldStartVNode, newEndVNode)

      // 如果旧的开始和新的结尾匹配，那么要把旧的开始的元素移动到旧的列表的最后面
      el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)

      oldStartVNode = oldChildren[++oldStartIndex]
      newEndVNode = newChildren[--newEndIndex]
    } else if (isSameVNode(oldEndVNode, newStartVNode)) {
      // 4. 旧的结尾和新的开始比较
      patch(oldEndVNode, newStartVNode)

      // 如果旧的结尾和新的开头匹配，那么要把旧的结尾的元素移动到旧的列表的最前面
      el.insertBefore(oldEndVNode.el, oldStartVNode.el)

      oldEndVNode = oldChildren[--oldEndIndex]
      newStartVNode = newChildren[++newStartIndex]
    } else {
      // 5. 乱序比较
      // 第一步：需要将旧的内容里面的key和对应的下标做一个映射关系
      // 第二步：从新children的第一个key开始，去映射表里找，如果找到，说明能复用。找不到则说明需要新建
      let moveIndex = keysMap[newStartVNode.key]

      if (moveIndex === undefined) {
        // 说明在映射表中找不到，此时直接新建元素并在最前面插入即可
        const insertNode = createElm(newStartVNode)
        el.insertBefore(insertNode, oldStartVNode.el)
      } else {
        // 说明在映射表中可以匹配上，此时可以复用节点。根据下标找到这个元素，移动到最前面
        const moveNode = oldChildren[moveIndex]
        oldChildren[moveIndex] = null // 把这个位置的元素移动走了，赋值为null，防止下标乱掉
        el.insertBefore(moveNode, oldStartVNode.el)
        patch(moveNode, newStartVNode)
      }
      newStartVNode = newChildren[++newStartIndex]
    }
  }

  // 上面的循环结束，如果新的children还没循环完，说明剩下的都是新增的
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i < newEndIndex; i++) {
      const child = createElm(newChildren[i])

      // 看一下指针下一个是否有元素，如果有，则是在前面添加，如果没有则是在最后面添加
      // insertBefore第二个参数为null的话，效果和appendChild一样
      const anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null
      el.insertBefore(child, anchor)
    }
  }

  // 如果旧的children还没循环完，说明剩下的都是需要移除掉的
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i < oldEndIndex; i++) {
      // 因为在乱序比较的时候，元素可能被移动了。对应的下标就没有内容了。所以加个判断
      if (oldChildren[i]) {
        const child = oldChildren[i].el
        el.removeChild(child)
      }
    }
  }
}

function createComponent(vnode) {
  // 初始化的作用
  // 需要创建组件的实例
  let i = vnode.data
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)
  }

  // 执行完毕后
  if (vnode.componentInstance) {
    return true
  }
}

function createElm(vnode) {
  const { tag, children, key, data, text } = vnode

  if (typeof tag === 'string') {
    // 1. 标签
    // 不是tag是字符串的就是普通的html  还有可能是我们的组件

    // 实例化组件
    if (createComponent(vnode)) {
      // 表示是组件, 这里应该返回的是真实的dom元素
      return vnode.componentInstance.$el
    }

    vnode.el = document.createElement(tag) // 创建真实dom的时候，挂载到当前vnode上，dom-diff的时候用到
    updateProperties(vnode)
    children.forEach((child) => {
      // 递归创建儿子节点，将儿子节点扔到父节点中
      return vnode.el.appendChild(createElm(child))
    })
  } else {
    // 2. 文本节点
    vnode.el = document.createTextNode(text) // 虚拟dom上映射着真实dom  方便后续更新操作
  }

  return vnode.el
}

// 更新属性
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data
  let el = vnode.el

  // dom-diff的时候，判断新旧属性，如果旧的有，新的没有，则要移除对应的属性
  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }

  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }

  for (let key in newProps) {
    if (key === 'style') {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps.class
    } else {
      el && el.setAttribute(key, newProps[key])
    }
  }
}
