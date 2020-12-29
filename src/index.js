import Vue from 'vue'

let vm = new Vue({
  el: '#app',
  data () {
    return {
      msg: 'hello',
      school: { name: 'zf', age: 10 },
      arr: [1, 2, 3]
    }
  },
  computed: {

  },
  watch: {
    msg (newValue, oldValue) {
      console.log(newValue, 'newValue')
      console.log(oldValue, '=oldValue')
    }
  }
})
vm.arr.push(200)
vm.msg = 'word'
console.log(vm)