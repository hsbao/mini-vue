import { parseHTML } from './parse-html'
import { generate } from './generate'

/**
 * 将template字符串编译成ast语法树：ast语法树是用对象来描述原生语法，虚拟DOM是用对象来描述DOM节点
 * <div id="app"><p>ast</p></div>
 * 
 * let root = {
 *   tag: 'div',
 *   attrs: [{name:'id', value: 'app'}],
 *   parent: null,
 *   type: 1,
 *   children: [{
 *     tag: 'p',
 *     attrs: [],
 *     parent: root,
 *     type: 1,
 *     children: [{
 *       text: 'ast',
 *       type: 3   
 *     }]
 *   }]
 * }
 */
export function compileToFunction(template) {
  // 1. 解析template字符串，编译成ast语法树
  const root = parseHTML(template)
  console.log('ast-----', root)

  // 需要将ast语法树生成最终的render函数  就是字符串拼接 （模板引擎）
  let code = generate(root)
  console.log('code-----', code)
  // 核心思路就是将模板转化成 下面这段字符串
  //  <div id="app"><p>hello {{name}}</p> hello</div>
  // 将ast树 再次转化成js的语法
  //  _c("div",{id:app},_c("p",undefined,_v('hello' + _s(name) )),_v('hello'))

  // 所有的模板引擎实现 都需要new Function + with
  let renderFn = new Function(`with(this){ return ${code}}`);

  // vue的render 他返回的是虚拟dom
  return renderFn;
}
