let id = 0

class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }
  addSub (watcher) { // 订阅
    this.subs.push(watcher)
  }
  notify () {
    this.subs.forEach(watcher => watcher.update())
  }
  depend () {
    if (Dep.target) {
      // Dep.target 是一个渲染 watcher
      Dep.target.addDep(this)
    }
  }
}

// 用来保存当前的watcher
let stack = []
export function pushTarget (watcher) {
  Dep.target = watcher
  stack.push(watcher)
}
export function popTarget () {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep // 用来收集依赖， 收集的是一个个watcher