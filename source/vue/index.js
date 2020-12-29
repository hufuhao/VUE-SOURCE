import { initState } from './observe'
import Watcher from './observe/watcher'
import { compiler, util } from './utils'
function Vue (options) {
  // 初始化vue 
  this._init(options)
}
Vue.prototype._init = function (options) {
  let vm = this
  vm.$options = options
  // 初始化状态 data computed watch
  // 进行数据劫持，属性增加getter 和 setter和劫持数组原生方法
  initState(vm)

  if (vm.$options.el) {
    vm.$mount()
  }
}
Vue.prototype.$watch = function (expr, handler, opts) {
  let vm = this
  new Watcher(vm, expr, handler, { user: true, ...opts })
}
function query (el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  }
  return el
}
Vue.prototype._update = function () {
  console.log('更新数据')
  // 用用户传入的数据，去更新视图
  let vm = this
  let el = vm.$el

  // 要循环这个元素 将里面的内容 换成我们的数据 如 {{}}
  let node = document.createDocumentFragment()
  let firstChild
  //每次拿到第一个元素，将元素依次放到node里面
  while (firstChild = el.firstChild) {
    // appendChild 具有移动的功能
    node.appendChild(firstChild)
  }

  compiler(node, vm)

  el.appendChild(node)
}
Vue.prototype.$mount = function () {
  let vm = this
  let el = vm.$options.el // 获取元素
  el = vm.$el = query(el) // 获取当前挂载的节点

  // 接下来要渲染页面，渲染是同watcher来渲染的，渲染watcher
  // vue2.0组架级别更新

  let updateComponent = () => { // 更新组件，渲染组件
    vm._update()
  }
  // 渲染watcher，默认用调用updateComponent
  new Watcher(vm, updateComponent)
}

// object.defineProperty 的缺点
// 1、无法追踪新增属性和删除属性
// 2、把无法监听数组 的情况通过重写数组的部分方法来实现响应式，但是只局限在以下7种方法 
export default Vue

// 1、使用watcher 进行初始化渲染：实例化一个Watcher，并将watcher存到Dep.target, 执行渲染函数，并下一次调用时删除上次存的watcher
// 2、当msg被获取时，实例化一个Dep，调用Dep depend方法，每一个msg对应一个dep
// 3、调用初始化渲染传入watcher，执行watcher里的addDep方法，使用set 进行一个去重，将watcher存入dep里， dep存入watcher里
// 4、当msg被改变时，调用dep 中存入的watcher，发布， 执行存入watcher.update方法重新渲染
// 5、当修改多个属性时，会执行多次的渲染，将update方法进行去重，先放到一个队列中，并同步方法执行完毕后，在执行渲染方法
// 只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次,
// Vue 在内部尝试对异步队列使用原生的
// Promise.then(微任务)=>mutationObserver(微任务)=>MessageChannel(宏任务，ie支持，高版本谷歌也可以)=>setTimeout(fn, 0)(宏任务，最终方案)


// 数组的依赖收集更新
// 在初始化时，为每个对象上都定义一个__ob__的属性this,指向当前的watcher，并在监听每个属性的时候收集数组的依赖，
// 用户调用数组原型上的方法时，根据__ob__找到watcher对应的dep，调用notify方法

// wtach
// 创建一个new Watcher, 初始化时默认会调用get方法，获取到旧值，变化完之后会调用run方法 拿到新值，然后传给用户