import { Dep } from './watcher'

export class Observer {
  constructor(data) {
    // 提供一个解析方法, 完成属性的分析和劫持
    observe(data)
  }
}

function observe(data) {
  // 判断数据的有效性, 必须是对象
  if (!data || typeof data !== 'object') {
    return
  }
  // 针对当前对象属性的重新定义 (劫持)
  const keys = Object.keys(data)

  keys.forEach(key => {
    defineReactive(data, key, data[key])
  })
}

// 解析数据, 完成对数据属性的 "劫持",  (控制对象的 getter 和 setter 方法)
function defineReactive(obj, key, val) {
  observe(val)
  const dep = new Dep()
  // 重新定义
  // 1. 目标对象
  // 2. 属性值
  // 3. 属性配置
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: false,
    // 特权方法
    get() {
      // 针对 watcher 创建时, 直接完成发布订阅的添加
      Dep.target && dep.addSub(Dep.target)
      return val
    },
    set(newVal) {
      console.log('set')
      observe(newVal)
      val = newVal
      dep.notify()
    }
  })
}