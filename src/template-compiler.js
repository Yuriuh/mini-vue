import { Watcher } from './watcher'

const insertionRe = /{{(\s*)[a-zA-Z0-9_.]+(\s*)}}/g

export class TemplateCompiler {
  constructor(el, vm) {
    // 缓存重要的属性
    this.el = this.isElementNode(el)
      ? el
      : document.querySelector(el)

    this.vm = vm

    // 判断视图存在
    if (this.el) {
      // 1. 把模板内容放入内存 (fragment)
      const fragment = this.nodeToFragment(this.el)
      // 2. 解析模板
      this.compile(fragment)
      // 3. 把内存的结果，返回到页面
      this.el.appendChild(fragment)
    }
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isDirective(attrName) {
    return attrName.includes('v-')
  }
  // 把模板放入内存，等待解析
  nodeToFragment(node) {
    // 1. 创建内存片段
    const fragment = document.createDocumentFragment()
    // 2. 把模板内容丢到内存
    let child
    while (child = node.firstChild) {
      // console.log('child', child)
      fragment.appendChild(child)
    }
    return fragment
  }
  compile(parent) {
    // 1. 获取子节点
    let childNodes = parent.childNodes
    // 2. 遍历每一个节点
    childNodes = Array.from(childNodes)
    childNodes.forEach(node => {
      // 3. 判断节点类型
        // 1) 元素节点 (解析指令)
        if (this.isElementNode(node)) {
          const text = node.textContent
          if (isInsertion(text)) {
            const expr = getInsertionExpr(text)
            this.compileText(node, expr)
          }
          this.compileElement(node)
        }
        // 2) 文本节点 (解析指令)
        else if (this.isTextNode(node)) {
          // 定义文本表达式验证规则
          const expr = node.textContent
          // 按照规则校验内容
          if (insertionRe.test(expr)) {
            expr = RegExp.$1
            this.compileText(node, expr)
          }
        }
    })
    // 4. 如果还有子节点, 继续解析
  }
  // 解析元素节点的指令
  compileElement(node) {
    // 1. 获取当前元素的所有属性
    let attrs = node.attributes
    // 2. 遍历当前元素的所有属性
    attrs = Array.from(attrs)
    attrs.forEach(attr => {
      const attrName = attr.name
      // 3. 判断属性是否是指令
      if (this.isDirective(attrName)) {
        // 4. 搜集
        // 指令类型
        const type = attrName.slice(2)
        // 指令的值就是表达式
        const expr = attr.value
        // 5.找帮手
        CompilerUtil[type](node, this.vm, expr)
      }
    })
  }
  // 解析文本里面的插值表达式 {{ expression }}
  compileText(node, expr) {
    CompilerUtil.text(node, this.vm, expr)
  }
}

const CompilerUtil = {
  // 解析 text 指令
  text(node, vm, expr) {
    console.log('expr in text', expr)
    // 1. 找到更新规则对象的更新方法
    var updaterFn = this.updater['textUpdater']
    // 2. 执行方法
    const value = getValue(vm.$data, expr)
    updaterFn && updaterFn(node, value)
    // updaterFn && updaterFn(node, vm.$data[expr])

    // 第 n+1 次
    new Watcher(vm, expr, (newValue) => {
      // 触发订阅时, 按照之前的规则, 对节点进行更新
      updaterFn && updaterFn(node, newValue)
    })
  },
  // 解析 model 指令
  model(node, vm, expr) {
    console.log('expr in model', expr)
    // 1. 找到更新规则对象的更新方法
    var updaterFn = this.updater['modelUpdater']
    // 2. 执行方法
    const value = getValue(vm.$data, expr)
    updaterFn && updaterFn(node, value)
    // updaterFn && updaterFn(node, vm.$data[expr])

    // 对 model 指令也添加一个订阅者
    new Watcher(vm, expr, (newValue) => {
      // 触发订阅时, 按照之前的规则, 对节点进行更新
      updaterFn && updaterFn(node, newValue)
    })

    // 3. 视图到模型
    node.addEventListener('input', e => {
      // 获取输入框的新值
      const newValue = e.target.value
      vm.$data[expr] = newValue
    })
  },
  // 更新规则对象
  updater: {
    // 文本更新方法
    textUpdater(node, value) {
      node.textContent = value
    },
    // 输入框更新方法
    modelUpdater(node, value) {
      node.value = value
    }
  }
}

function isInsertion(text) {
  const t = text.trim()
  return t.startsWith('{{') && t.endsWith('}}')
}

function getInsertionExpr(text) {
  let t = text.trim()
  t = t.slice(2, text.length - 2).trim()
  return t
}

function getValue(obj, name) {
  if (!obj) return obj

  const nameList = name.split('.')
  let temp = obj
  for (let i = 0; i < nameList.length; i++) {
    if (temp[nameList[i]] != null) {
      temp = temp[nameList[i]]
    } else {
      return void 0
    }
  }
  return temp
}