import { isObject } from '../utils/index'

// 在data中的属性，都要使用Object.defineProperty重新定义
// Object.defineProperty不能兼容ie8，所以vue2无法兼容ie8版本
export function observe(data) {
  const isObj = isObject(data)
	if (!isObj) {
		return
	}
	return new Observer(data)
}

class Observer {
	constructor(data) {
		// vue中的data，如果数据的层次过多，需要递归的去解析数据中的属性，依次增加get和set
		// 这也是性能消耗的地方，所以vue3改为proxy，不用递归
		this.walk(data)
	}

	walk(data) {
		const keys = Object.keys(data)
		keys.forEach(key => {
			defineReactive(data, key, data[key])
		})
	}
}

function defineReactive(data, key, value) {
	observe(value) // 递归，依次给每个属性都加上get和set
	Object.defineProperty(data, key, {
		get() {
			return value
		},
		set(newValue) {
			if (value === newValue) {
				return
			}
			observe(newValue) // 有可能赋值的时候是一个新的对象，所以也要进行数据劫持
			value = newValue
		}
	})
}