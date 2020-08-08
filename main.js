import { MVVM } from './src/mvvm'

var vm = new MVVM({
  el: '#app',
  data: {
    message: '大帅比',
    obj: {
      a: '呵呵'
    }
  }
})

window.vm = vm