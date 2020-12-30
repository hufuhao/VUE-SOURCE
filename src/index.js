import Vue from 'vue'

let vm = new Vue({
  el: '#app',
  data () {
    return {
      msg: 'hello',
      school: { name: 'zf', age: 10 },
      arr: [1, 2, 3],
      firstName: 'hu',
      lastName: 'fuhao'
    }
  },
  computed: {
    fullName () {
      return this.firstName + this.lastName
    }
  },
  watch: {
    // msg (newValue, oldValue) {
    //   console.log(newValue, '=newValue')
    //   console.log(oldValue, '=oldValue')
    // }
    // msg: {
    //   handler (newValue, oldValue) {
    //     console.log(newValue, '=newValue')
    //     console.log(oldValue, '=oldValue')
    //   },
    //   immediate: true
    // }
  }
})
vm.firstName = '李'
// vm.firstName = '张'
console.log(vm)