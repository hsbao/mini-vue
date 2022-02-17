const oldArrayMethods = Array.prototype

/**
 * value.__proto__ = arrayMethods
 * arrayMethods.__proto__ = oldArrayMethods
 * 当操作数组方法的时候，会先查找重写后的，重写的没有会继续向Array.prototype查找
 */
export const arrayMethods = Object.create(oldArrayMethods)

const methods = ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse']
methods.forEach((method) => {
	// arrayMethods['push] = function(...args) {}
	// 重写 7 个方法，加上一些逻辑
  arrayMethods[method] = function(...args) {
		const result = oldArrayMethods[method].apply(this, args)

		const ob = this.__ob__
		let inserted
		switch (method) {
			case 'push':
			case 'unshift':
				inserted = args
				break
			case 'splice':
				inserted = args.slice(2)
				break
			default:
				break
		}

		if (inserted) {
			// inserted 如果有值，那么就是一个数组，所以要继续监测数组里面的对象
			ob.observerArray(inserted)
		}

		ob.dep.notify() // 调用这7个方法修改数组的时候，触发更新。这里的dep是Observer中的dep

		return result
	}
})
