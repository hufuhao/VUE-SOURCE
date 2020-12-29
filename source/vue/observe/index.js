
import Observe from './observe'
export function initState (vm) {
  let opts = vm.$options
  if (opts.data) {
    initData(vm) // 初始化data
  }
  if (opts.computed) {
    initComputed() // 初始化computed
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

function initComputed () {

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