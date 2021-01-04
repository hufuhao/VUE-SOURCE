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
  let newProps = vnode.props // 获取当前节点中的属性
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
  console.log(oldVnode.tag, newVnode.tag)
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

function updateChildren (parent, oldChildren, newChildren) {

}