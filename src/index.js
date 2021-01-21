import Vue from 'Vue'

let vm = new Vue({
  el: '#app',
  data () {
    return { msg: 'hello zf' }
  },
  render (h) { // 内部默认会调用此方法，将this指向实例
    return h('p', { id: 'a' }, this.msg)
  }
})

setTimeout(() => {
  vm.msg = 'hello word'
}, 1000)