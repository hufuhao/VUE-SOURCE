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

  // 如果老的中有属性 新的中没有
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  for (let key in oldProps) {
    if (!newProps[key]) {
      delete el[key] // 如果新的中没有这个属性了 那就直接在dom中删掉这个属性
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