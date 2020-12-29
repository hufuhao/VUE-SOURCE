import { pushTarget, popTarget } from './dep'
let id = 0
/**
 * @param {*} vm 当前组架的实例
 * @param {*} exprOrFn 用户可能传入的是一个表达式 也有可能传入的是一个函数
 * @param {*} cb 用户传入的回调函数
 * @param {*} opts 一些其他参数
 */
class Watcher {
  constructor(vm, exprOrFn, cb = () => { }, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn
    }
    this.depsId = new Set()
    this.deps = []
    this.cb = cb
    this.opts = opts
    this.id = id++

    this.get()
  }
  get () {
    // 初始化渲染watcher，Dep.target = warcher
    pushTarget(this)

    this.getter()  // 传入的 exprOrFn 渲染
    // 渲染完成之后，删除传入的watcher
    popTarget()
  }
  update () {
    // this.get()
    queueWatcher(this)
  }
  run () {
    this.get()
  }
  addDep (dep) {
    // msg 的 dep
    let id = dep.id
    if (!this.depsId.has(id)) { // 让watcher和dep互相记忆
      this.depsId.add(id)
      this.deps.push(dep) // 让watcher 记住了当前dep
      dep.addSub(this)
    }
  }
}
// 批量更新， 去重
let has = {}
let queue = []
function flushQueue () {
  // 等待当前这一轮全部更新后， 再让watcher依次执行
  queue.forEach(watcher => watcher.run())
  has = {}
  queue = []
}
function queueWatcher (watcher) { // 对重复的watcher进行过滤
  let id = watcher.id
  if (has[id] == null) {
    has[id] = true
    queue.push(watcher)
    // 延迟清空队列
  }
  nextTick(flushQueue)
  console.log(has, '=has')
}
let callbacks = []
function flushCallbacks () {
  callbacks.forEach(cb => cb())
}
function nextTick (cb) {
  callbacks.push(cb)
  let timerFunc = () => {
    flushCallbacks()
  }
  if (Promise) {
    return Promise.resolve().then(timerFunc)
  }
  // 用来监视 DOM 变动。DOM 的任何变动，比如节点的增减、属性的变动、文本内容的变动，这个 API 都可以得到通知。
  if (MutationObserver) { // 微任务
    let observe = new MutationObserver(timerFunc)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, { characterData: true })
    textNode.textContent = 2
    return
  }
  if (setImmediate) {
    return setImmediate(timerFunc)
  }
  setTimeout(timerFunc, 0)
}

export default Watcher