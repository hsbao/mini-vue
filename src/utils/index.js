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
		value
	})
}