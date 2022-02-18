import { observe } from './observe/index'
import Watcher from './observe/watcher'

import { proxy } from './utils/index'

export function initWatchMixin(Vue) {
	Vue.prototype.$watch = function(key, handler, options = {}) {
		const vm = this
		options.user = true // 表示是一个用户写的watcher
		/**
		 * vm
		 * key：watch里监听的属性
		 * handler：function (newVal, oldVal) {}
		 * options
		 */
		new Watcher(vm, key, handler, options)
	}
}

export function initState(vm) {
	const opts = vm.$options
	// vue的数据来源：属性，方法，数据，计算属性，watch
	if (opts.props) {
		initProps(vm)
	}
	if (opts.methods) {
		initMethods(vm)
	}
	if (opts.data) {
		initData(vm)
	}
	if (opts.computed) {
		initComputed(vm)
	}
	if (opts.watch) {
		initWatch(vm)
	}
}

function initProps(vm) {}
function initMethods(vm) {}
function initData(vm) {
	let data = vm.$options.data
	data = vm._data = typeof data === 'function' ? data.call(vm) : data // data.call(vm) 为了保证在data里面使用的this指向当前实例

	// 为了让用户更好的使用 我希望可以直接vm.xxx
	for (let key in data) {
		proxy(vm, '_data', key)
	}

	// 数据劫持，使用Object.defineProperty()给属性增加get和set方法
	// 也就是MVVM模块，属性改变，得到通知，从而刷新页面（响应式原理）
	observe(data)
}
function initComputed(vm) {}
function initWatch(vm) {
	const watch = vm.$options.watch
	for (let key in watch) {
		const handler = watch[key]

		/**
		 * watch的回调可能是一个数组放了很多不同的方法
		 * watch: {
		 *   name: [function (newVal, oldVal) {}, function (newVal, oldVal) {}]
		 *   age(newVal, oldVal) {}
		 * }
		 */
		if (Array.isArray(handler)) {
			for (let i = 0; i < handler.length; i++) {
				createWatcher(vm, key, handler[i])
			}
		} else {
			createWatcher(vm, key, handler)
		}
	}
}

function createWatcher(vm, key, handler) {
	return vm.$watch(key, handler)
}
