// 这个文件除了第一次的初始化渲染之外，还有做对比操作

// 让虚拟节点 渲染成真实节点
export function render (vnode, container) {
  let el = createElm(vnode)
  container.appendChild(el)
}

function createElm (vnode) {
  let { tag, children, key, props, text } = vnode
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag)
    updateProperties(vnode)
    children.forEach(child => {
      return render(child, vnode.el)
    })
  } else { // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
function updateProperties (vnode, oldProps = {}) {
  let newProps = vnode.props || {} // 获取当前节点中的属性
  let el = vnode.el // 真实的节点

  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  // 如果老的有style 新的没有style 就将属性style置为空
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  // 如果新的中没有这个属性了 那就直接在dom中删掉这个属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      delete el[key]
    }
  }
  for (let key in newProps) {
    if (key === 'style') { // 如果是style 需要再次便利添加
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key == 'class') {
      el.className = newProps.class
    } else { // 给这个元素添加属性
      el[key] = newProps[key]
    }
  }
}

export function patch (oldVnode, newVnode) {
  // 1) 先比对 标签是否一致
  if (newVnode.tag !== oldVnode.tag) {
    // 先拿到当前元素的父级
    oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
  }
  // // 2) 比较文本 标签一样 可能都是undefined, 上一步已经判断过，所以标签要不然都有 要不然都没有
  if (!oldVnode.tag) {
    if (oldVnode.text !== newVnode.text) {
      // 如果内容不一致 直接替换
      oldVnode.el.textContent = newVnode.text
    }
  }
  // 标签一样 属性不一样
  let el = newVnode.el = oldVnode.el
  updateProperties(newVnode, oldVnode.props)

  // 3) 比较孩子
  let oldChildren = oldVnode.children || []
  let newChildren = newVnode.children || []

  // 老的有孩子 新的也有孩子 updateChildren
  if (oldChildren.length > 0 && newChildren.length > 0) {
    updateChildren(el, oldChildren, newChildren)
  } else if (oldChildren.length > 0) { // 老的有孩子 新的没孩子
    el.innerHTML = ''
  } else if (newChildren.length > 0) { // 新的有孩子 老没孩子
    for (let i = 0; i < newChildren.length; i++) {
      let child = newChildren[i]
      el.appendChild(createElm(child))
    }
  }
}
function isSameVnode (oldVnode, newVnode) {
  // 如果两个人的标签和key一样 我认为是同一个节点
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}

// 头和头比， 尾和尾比，头和尾比， 尾和头比
// 给我们的元素都添加一个头尾指针，并且进行双向比较，默认会先去比对，老节点和新节点是同一个，先从开头比，比对完之后往后移，不听的进行比对，如果比完之后，我们的新节点比老节点多，会把节点插进去
// 也有可能往前插入，就拿老的结束节点和新的结束节点进行比较，把指针往前移，从后前比较,
// 如果头部和尾部都不一样，就拿旧的头部 和 新的结尾 进行倒叙比较
function updateChildren (parent, oldChildren, newChildren) {
  // vue增加了很多优化策略 因为在浏览器中操作dom最常见的方法是 开头或者结尾插入
  // 设计到正序和倒叙

  let oldStartIndex = 0 // 老的索引开始
  let oldStartVnode = oldChildren[0] // 老的节点开始
  let oldEndIndex = oldChildren.length - 1 // 老的索引结束
  let oldEndVnode = oldChildren[oldEndIndex] // 老的节点结尾

  let newStartIndex = 0 // 新的索引开始
  let newStartVnode = newChildren[0] // 新的节点开始
  let newEndIndex = newChildren.length - 1 // 新的索引结束
  let newEndVnode = newChildren[newEndIndex] // 新的节点结尾

  function makeIndexByKey (children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map // { a:0,b:1 ... }
  }
  let map = makeIndexByKey(oldChildren)
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    // 向后插入
    else if (isSameVnode(oldStartVnode, newStartVnode)) { // 从头部开始对比
      patch(oldStartVnode, newStartVnode) // 用新的属性来更新老的属性，递归比较儿子
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
    // 向前插入
    else if (isSameVnode(oldEndVnode, newEndVnode)) { // 从尾部开始对比
      patch(oldEndVnode, newEndVnode) // 比较孩子
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 倒叙 abcd  dcba
    else if (isSameVnode(oldStartVnode, newEndVnode)) { // 倒叙对比
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 老的尾巴和新的头去比 将老的尾巴移动到老的头前面 abcd dabc
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
    // 两个列表乱序 不赋用
    // 先拿新节点的第一项去老节点里面取做对比，如果找不到，就将新节点的第一项放到老节点前面，同时新节点指针往后走一位
    // 如果在旧节点中找到跟当前新节点的节点是同一个，就将这个节点插入到旧节点前面，并放入一个undefined,否则数组会塌陷,同时旧节点和新节点都向后移动一位
    // 对比到最后，可能老节点中还有剩余 则直接删除老节点剩余的属性
    else {
      let moveIndex = map[newStartVnode.key]
      if (moveIndex == undefined) { // 如果旧列表中找不到， 就将当前值移动到放到当前老节点前面
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveVnode = oldChildren[moveIndex]
        oldChildren[moveIndex] = undefined // 一会移动之后防止数组坍陷
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
        patch(moveVnode, newStartVnode)
      }
      // 要将新节点的指针向后移动
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  // 如果到最后还剩余 需要将剩余的插入， 新的节点开始下标 小于等于 新的节点结束的下标
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      // insertBefore(插入的元素, null) = appendChild
      parent.insertBefore(createElm(newChildren[i]), ele)
      // parent.appendChild(createElm(newChildren[i]))
    }
  }
  // 删除多余的旧的值
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]
      if (child != undefined) {
        parent.removeChild(child.el)
      }
    }
  }
  // 循环尽量不要使用索引当做key 可能会导致重新创建当前元素的所有元素
}