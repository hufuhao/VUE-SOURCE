// 初始化 将虚拟几点渲染到页面上

// 初始化 将虚拟节点渲染到页面上
import { h, render } from './vdom'
let oldVnode = h('div', { id: 'container', key: 1 },
  h('span', { style: { color: 'red' } }, 'hello'),
  'zf'
)
let container = document.getElementById('app')
render(oldVnode, container)