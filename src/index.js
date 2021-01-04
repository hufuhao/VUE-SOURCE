// 初始化 将虚拟几点渲染到页面上
import { h, render, patch } from './vdom'
// tag 标签名, props属性 children
let oldVnode = h('div', { id: 'container', style: { background: 'red' } },
  h('span', { style: { color: 'red', background: 'yellow' } }, 'hello'),
  'zf',
)
let container = document.getElementById('app')
render(oldVnode, container)

// patchVnode 用新的虚拟节点 和 老的虚拟节点做对比， 更新真是dom元素
let newVnode = h('div', { id: 'aa', style: { background: 'yellow' } },
  h('span', { style: { color: 'red' } }, 'word'),
  'px',
)

setTimeout(() => {
  patch(oldVnode, newVnode)
}, 1000)

