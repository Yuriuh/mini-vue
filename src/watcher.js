export class Watcher {
  // 1. node 是需要使用订阅功能的节点
  // 2. vm 全局 vm 对象, 用于获取数据
  // 3. cb 发布时需要做的事情
  constructor(vm, expr, cb) {
    // 缓存重要属性
    this.vm = vm
    this.expr = expr
    this.cb = cb
    // 缓存当前值
    this.value = this.get()
  }
  // 获取当前值
  get() {
    // 把当前订阅者添加到全局
    Dep.target = this
    const value = this.vm.$data[this.expr]
    // 清空全局
    Dep.target = null
    return value
  }
  // 提供一个更新方法(应对发布后, 要做的事情)
  update() {
    // 获取新值和老值
    // 判断后执行回调
    const newVal = this.vm.$data[this.expr]
    const oldVal = this.value
    if (newVal !== oldVal) {
      // 执行回调
      this.cb(newVal)
    }
  }
}

// 创建发布者
// 1. 管理订阅者
// 2. 通知
export class Dep {
  constructor() {
    this.subs = []
  }
  // 添加订阅
  addSub(sub) {
    this.subs.push(sub)
  }
  // 集体通知
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}