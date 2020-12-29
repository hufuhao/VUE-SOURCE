import { observe } from './index.js'
import Dep from './dep'
import { arraryMethos, observerArray } from './arrary'
export function defineReactive (data, key, value) { // 定义响应式的数据变化，闭包
  let childOb = observe(value) // 如果数据深层次嵌套，value依旧是一个对象的话，递归调用  {school: age: {a:1} }
  // dep 里可以收集依赖， 这里收集的是watcher，
  // 同时让这个watcher里面也存放dep,实现一个多对多的关系
  let dep = new Dep()
  Object.defineProperty(data, key, {
    // 依赖收集
    get () {
      // 在 watcher中存入的 this, target指的是watcher
      if (Dep.target) {
        // 存入的watcher不能重复，重复的话会造成多次渲染
        dep.depend()
        if (childOb) {
          // 数组的依赖收集，数组也收集了当前的渲染watcher
          childOb.dep.depend()
        }
      }
      return value
    },
    // 通知依赖更新
    set (newValue) {
      if (newValue == value) return
      // 如果设置的值是一个对象的话，再重新进行观测
      observe(newValue)
      value = newValue
      // 发布 执行存入watcher里 update方法重新渲染
      dep.notify()
    }
  })
}

class Observe {
  constructor(data) { // data 就是vm._data
    this.dep = new Dep() // 专门为数组定义的dep

    // 每个对象 包括数据都有一个__ob__属性，返回的都是当前的observe实例
    Object.defineProperty(data, '__ob__', {
      get: () => this
    })
    if (Array.isArray(data)) {
      // 重写数组上的原型，进行拦截
      data.__proto__ = arraryMethos
      // 如果数组里有对象，进行观测
      observerArray(data)
    } else {
      this.walk(data)
    }

  }
  walk (data) {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let value = data[keys[i]]
      defineReactive(data, key, value)
    }
  }
}


export default Observe
