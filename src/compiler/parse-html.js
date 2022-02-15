const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配标签开头，捕获的内容是标签名称，如：<div> ---> div
// let r = '<a:b>'.match(startTagOpen)
// console.log(r) // ['<a:b', 'a:b', index: 0, input: '<a:b>', groups: undefined]  第一个是匹配到的标签，第二个是匹配到的标签名称

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾，如：</div>
const attribute =
	/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配标签上的属性
// console.log('id="app"'.match(attribute)) // ['id="app"', 'id', '=', 'app', undefined, undefined, index: 0, input: 'id="app"', groups: undefined]

const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的那个 > 符号
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{ xxx }}


export function parseHTML(html) {
	let root = null // ast语法树的树根
	let currentParent // 标识当前parent是哪个元素
	let stack = [] // 每匹配到一个标签就放到栈中，遇到闭合标签就出栈。到最后数组长度为空，说明标签都对应匹配上了
	const ELEMENT_TYPE = 1 // 表示元素节点
	const TEXT_TYPE = 3 // 表示文本节点

  function createASTElement(tagName, attrs) {
    return {
      attrs,
      tag: tagName,
      type: ELEMENT_TYPE,
      parent: null,
      children: [],
    }
  }
  
  function start(tagName, attrs) {
    // console.log('开始标签：', tagName, '属性是：', attrs)
    // 开始匹配标签时，就创建一个ast元素
    let element = createASTElement(tagName, attrs)
    if (!root) {
      root = element
    }
    currentParent = element // 把当前元素标识成父ast树
    stack.push(element) // 将开始标签放入栈中
  }

  /**
   * start方法中，匹配到标签后，会创建一个ast元素，并把currentParent指向这个元素
   * 之后遇到文本内容，那么就是属于这个元素的子节点，要放在这个元素的children属性中
   * @param {*} text
   */
   function chars(text) {
    text = text.replace(/\s/g, '')
    if (text) {
      currentParent.children.push({
        text,
        type: TEXT_TYPE,
      })
    }
  }
  
  function end(tagName) {
    // console.log('结束标签：', tagName)
    let element = stack.pop()
    currentParent = stack[stack.length - 1]
  
    // 实现了一个树的父子关系
    if (currentParent) {
      element.parent = currentParent
      currentParent.children.push(element)
    }
  }
  
	// 解析html字符串
	while (html) {
		let textEnd = html.indexOf('<')
		if (textEnd === 0) {
			// 如果索引为0，说明是一个标签（可能是开始标签，也可能是结束标签）
			let startTagMatch = parseStartTag() // 通过这个方法获取到匹配结果，拿到标签名称
			if (startTagMatch) {
				// console.log('startTagMatch-----', startTagMatch) // { tagName: 'div', attrs: { name: 'id', value: 'app' } }
				start(startTagMatch.tagName, startTagMatch.attrs) // 1. 解析开始标签
				continue // 如果开始标签匹配完毕，继续下一次匹配
			}
			let endTagMatch = html.match(endTag)
			// console.log('endTagMatch', endTagMatch) // ['</div>', 'div', index: 0, input: '</div>', groups: undefined]
			if (endTagMatch) {
				advance(endTagMatch[0].length) // 解析结束标签
				end(endTagMatch[1])
				continue
			}
		}

		let text
		if (textEnd >= 0) {
			text = html.substring(0, textEnd)
		}
		if (text) {
			advance(text.length)
			chars(text) // 3. 解析文本
		}
	}

	/**
	 * 把匹配过的字符截取去掉
	 * @param {*} n 截取的长度
	 */
	function advance(n) {
		html = html.substring(n)
	}

	function parseStartTag() {
		let start = html.match(startTagOpen)
		if (start) {
			// console.log(start) //  ['<div', 'div', index: 0, input: '<div id="app"><p>hello</p><span>{{ name }}</span></div>', groups: undefined]
			const match = {
				tagName: start[1],
				attrs: [],
			}
			advance(start[0].length)

			let end, attr
			// console.log(attr = html.match(attribute)) // [' id="app"', 'id', '=', 'app', undefined, undefined, index: 0, input: ' id="app"><p>hello</p><span>{{ name }}</span></div>', groups: undefined]
			while (
				!(end = html.match(startTagClose)) &&
				(attr = html.match(attribute))
			) {
				advance(attr[0].length) // 匹配到属性后，也要把对应的字符截取去掉
				match.attrs.push({
					name: attr[1],
					value: attr[3] || attr[4] || attr[5],
				})
			}
			// console.log('end-------',end) // ['>', '', index: 0, input: '><p>hello</p><span>{{ name }}</span></div>', groups: undefined]
			if (end) {
				advance(end[0].length)
				return match
			}
		}
	}
	return root
}
