import { pushTarget, popTarget } from './dep'
import { util } from '../utils'
import { nextTick } from './nextTick'
let id = 0
/**
 * @param {*} vm 当前组架的实例
 * @param {*} exprOrFn 用户可能传入的是一个表达式 也有可能传入的是一个函数
 * @param {*} cb 用户传入的回调函数
 * @param {*} opts 一些其他参数
 */
class Watcher {
  //          vm, (newVlaue, oldValue) => {}, {user:true}
  //          vm, ()=>this.firstName + this.lastName  { lazy: true }
  constructor(vm, exprOrFn, cb = () => { }, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if (typeof exprOrFn == 'function') {
      this.getter = exprOrFn
    } else {
      this.getter = function () {
        // 调用此方法， 会将vms上对应的表达式取出来
        return util.getValue(vm, exprOrFn)
      }
    }
    // 标识是用户自己写的watcher
    if (opts.user) {
      this.user = true
    }
    this.lazy = opts.lazy // 如果这个值为true，说明他是计算属性
    this.dirty = this.lazy
    this.depsId = new Set()
    this.deps = []
    this.cb = cb
    this.opts = opts
    this.id = id++
    this.immediate = opts.immediate
    // 创建watcher的时候，先将表达式的值取出来(老值)
    // 如果当前我们是计算属性，不会默认调用get方法
    this.value = this.lazy ? undefined : this.get()
    if (this.immediate) {
      this.cb(this.value)
    }

  }
  get () {
    // 初始化渲染watcher，Dep.target = warcher
    pushTarget(this)

    // let vlaue = this.getter()  // 传入的 exprOrFn 渲染

    // 这个方法会将当前计算属性的watcher存起来 fullName() {return this.firstName+this.lastName}
    let vlaue = this.getter.call(this.vm)  // 传入的 exprOrFn 渲染
    // 渲染完成之后，删除传入的watcher
    popTarget()
    return vlaue
  }
  depend () {
    let i = this.deps.length
    console.log(this.deps, '==this.deps')
    while (i--) {
      this.deps[i].depend()
    }
  }
  update () {
    // this.get()
    if (this.lazy) {
      this.dirty = true // 计算属性依赖的值发生变化了，一会取值的时候重新计算
    } else {
      queueWatcher(this)
    }
  }
  run () {
    let value = this.get() // 新值
    if (this.vlaue !== value) {
      this.cb(value, this.value)
    }
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
  evaluate () {
    this.value = this.get()

    this.dirty = false // 值求过了 下次渲染的时候不用求了
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
}


export default Watcher