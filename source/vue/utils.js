const defaultRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export const util = {
  getValue (vm, expr) {
    // 解析出来有可能是 {{school.name}}, 在vm找到这个值
    let keys = expr.split('.')
    // reduce 具有迭代的功能， 第二个参数 传递给函数的初始值
    return keys.reduce((memo, current) => {
      memo = memo[current]
      return memo
    }, vm)
  },
  compilerText (node, vm) { // 编译文本 替换 {{XX}}
    // 多设置一个属性，将第一次的变量名字存下来msg  {{ msg }}
    if (!node.expr) {
      node.expr = node.textContent
    }
    node.textContent = node.expr.replace(defaultRE, function (...args) {
      return util.getValue(vm, args[1])
    })
  }
}

export function compiler (node, vm) { // node 就是组装好的文档碎片
  let childNodes = node.childNodes
  // 将类数组转化为数据
  let arrayChildNodes = [...childNodes]
  arrayChildNodes.forEach(child => {
    if (child.nodeType == 1) { // 1代表元素 3 文本
      // 如果是个元素 还需要编译元素的孩子节点
      compiler(child, vm) // 解析第二层
    } else if (child.nodeType == 3) {
      util.compilerText(child, vm)
    }
  })
}