import nextTick from '../utils/next-tick'

let queue = []
let has = {}

function flushSchedularQueue() {
  queue.forEach(watcher => watcher.run())
  queue = []
  has = {}
}

/**
 * 结合nextTick，异步执行watcher进行更新
 * @param {*} watcher 
 */
function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true

    nextTick(flushSchedularQueue)
  }
}

export default queueWatcher