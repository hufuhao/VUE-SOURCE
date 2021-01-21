// 初始化 将虚拟几点渲染到页面上
import { h, render, patch } from './vdom'
// tag 标签名, props属性 children
let oldVnode = h('div', { id: 'container' },
  h('li', { style: { background: 'red' }, key: 'a' }, 'a'),
  h('li', { style: { background: 'yellow' }, key: 'b' }, 'b'),
  h('li', { style: { background: 'blue' }, key: 'c' }, 'c'),
  h('li', { style: { background: 'pink' }, key: 'd' }, 'd'),
)
let container = document.getElementById('app')
render(oldVnode, container)

// patchVnode 用新的虚拟节点 和 老的虚拟节点做对比， 更新真是dom元素
let newVnode = h('div', { id: 'aa' },
  h('li', { style: { background: 'pink' }, key: 'e' }, 'e'),
  h('li', { style: { background: 'red' }, key: 'a' }, 'a'),
  h('li', { style: { background: 'yellow' }, key: 'f' }, 'f'),
  h('li', { style: { background: 'blue' }, key: 'c' }, 'c'),
  h('li', { style: { background: 'pink' }, key: 'n' }, 'n'),
)

setTimeout(() => {
  patch(oldVnode, newVnode)
}, 1000)

