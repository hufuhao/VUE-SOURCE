let callbacks = []
function flushCallbacks () {
  callbacks.forEach(cb => cb())
}

export function nextTick (cb) {
  callbacks.push(cb)
  let timerFunc = () => {
    flushCallbacks()
  }
  if (Promise) {
    return Promise.resolve().then(timerFunc)
  }
  // 用来监视 DOM 变动。DOM 的任何变动，比如节点的增减、属性的变动、文本内容的变动，这个 API 都可以得到通知。
  if (MutationObserver) { // 微任务
    let observe = new MutationObserver(timerFunc)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, { characterData: true })
    textNode.textContent = 2
    return
  }
  if (setImmediate) {
    return setImmediate(timerFunc)
  }
  setTimeout(timerFunc, 0)
}

