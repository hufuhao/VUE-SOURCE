
import Observe from './observe'
import Watcher from './watcher'
import Dep from './dep'
export function initState (vm) {
  let opts = vm.$options
  if (opts.data) {
    initData(vm) // 初始化data
  }
  if (opts.computed) {
    initComputed(vm) // 初始化computed
  }
  if (opts.watch) {
    initWatch(vm) // 初始化 watch
  }
}
function proxy (vm, source, key) { // 代理数据
  // vm.msg = 'hello'
  // vm._data.msg = 'hello'
  Object.defineProperty(vm, key, {
    get () {
      return vm[source][key]
    },
    set (newValue) {
      vm[source][key] = newValue
    }
  })
}
export function observe (data) {
  if (typeof data != 'object' || data == null) return
  if (data.__ob__) {
    return data.__ob__
  }
  return new Observe(data)
}
function initData (vm) {
  let data = vm.$options.data
  // 可能传入的data是个函数 或者 是个对象
  data = vm._data = typeof data == 'function' ? data.call(vm.$options) : data || {}

  for (let key in data) {
    // 取值代理， 如 vm.msg 代理成 vm._data.msg
    proxy(vm, '_data', key)
  }
  observe(data)
}

function createComputedGetter (vm, key) {
  // 通过vm取到d定义的 计算属性watcher
  let watcher = vm._watchersComputed[key]
  return function () {
    // 这个函数返回的值 就是计算属性的值
    if (watcher) {
      // 计算属性默认dirty为true，就会去调用watcher的get方法去取值
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) { // 疑问？
        // dep = [firstName.dep, lastName.dep], 都去收集渲染watcher
        watcher.depend()
      }
      return watcher.value
    }
  }
}
function initComputed (vm) {
  let computed = vm.$options.computed
  // 将计算属性的配置放到vm上
  let watchers = vm._watchersComputed = Object.create(null) // 创建储存计算属性的watcher对象
  for (let key in computed) {
    let userdef = computed[key]
    // new Watcher 什么都没做，配置属性了 lazy dirty
    // 将watchers[key]赋值到this上
    watchers[key] = new Watcher(vm, userdef, () => { }, { lazy: true }) // 计算属性
    // vm.funllName, 当用户取值时会调用get，执行 createComputedGetter
    Object.defineProperty(vm, key, {
      get: createComputedGetter(vm, key)
    })
  }
  console.log(computed)
}
function createWatcher (vm, key, handler, opts) {
  return vm.$watch(key, handler, opts)
}

function initWatch (vm) {
  let watch = vm.$options.watch
  for (let key in watch) {
    let userDef = watch[key]
    let handler = userDef
    if (userDef.handler) {
      handler = userDef.handler
    }
    createWatcher(vm, key, handler, { immediate: userDef.immediate })
  }
}