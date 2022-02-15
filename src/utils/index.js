/**
 * 判断是否是对象
 * @param {*} obj
 * @returns
 */
export function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}

export function def(data, key, value) {
	Object.defineProperty(data, key, {
		enumerable: false, // 是否可以枚举
		configurable: false, // 是否可以修改
		value,
	})
}

// 取值时实现代理效果
export function proxy(vm, source, key) {
	Object.defineProperty(vm, key, {
		get() {
			return vm[source][key]
		},
		set(newValue) {
			vm[source][key] = newValue
		},
	})
}
