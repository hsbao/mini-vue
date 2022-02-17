let callbacks = []
let waiting = false

// 在一个事件循环处理所有的回调
function flushCallbacks() {
	callbacks.forEach((cb) => cb())
	waiting = false
  callbacks = []
}

// vue2为了考虑兼容性，Vue3不再考虑兼容性问题
// 依次对 Promise，MutationObserver，setImmediate，setTimeout 进行判断
function timer(flushCallbacks) {
	let timerFn = () => {}
	if (Promise) {
		timerFn = () => {
			Promise.resolve().then(flushCallbacks)
		}
	} else if (MutationObserver) {
		let textNode = document.createTextNode(1)
		let observer = new MutationObserver(flushCallbacks) // 监视对DOM树所做更改
		observer.observe(textNode, { // 监听这个textNode，发生变化后，会调用实例化的时候传入的回调函数 --->  flushCallbacks
			characterData: true,
		})
		timerFn = () => {
			textNode.textContent = 3
		}
	} else if (setImmediate) {
    // 只有最新版本的Internet Explorer和Node.js 0.10+实现了setImmediate
		timerFn = () => {
			setImmediate(flushCallbacks)
		}
	} else {
		timerFn = () => {
			setTimeout(flushCallbacks)
		}
	}
	timerFn()
}

function nextTick(cb, ctx = null) {
	callbacks.push(cb)

	if (!waiting) {
		timer(flushCallbacks)
		waiting = true
	}
}

export default nextTick
