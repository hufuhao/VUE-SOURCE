// 劫持数组原生方法
import { observe } from './index'

let oldArrayProtoMethos = Array.prototype

export let arraryMethos = Object.create(oldArrayProtoMethos)

let methods = ['push', 'pop', 'unshift', 'shift', 'sort', 'reverse', 'splice']
export function observerArray (inserted) { // 对数组新增的每一项进行观测
  for (let i = 0; i < inserted.length; i++) {
    observe(inserted[i])
  }
}
methods.forEach(method => {
  arraryMethos[method] = function (...args) {  // 函数劫持
    let r = oldArrayProtoMethos[method].apply(this, args)
    let inserted
    switch (method) { // 有些方法可以新增数据，对新增的数据进行监控
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.splice(2) // 获取splice新增的内容
      default:
        break
    }
    if (inserted) {
      observerArray(inserted)
    }
    // 通知更新数据
    this.__ob__.dep.notify()
    return r
  }
})


