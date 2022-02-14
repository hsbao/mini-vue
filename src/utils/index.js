/**
 * 判断是否是对象
 * @param {*} obj 
 * @returns 
 */
export function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}