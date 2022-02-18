import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'

import { initGlobalAPI } from './initGlobalAPI/index'
import { initWatchMixin } from './state'


function Vue(options) {
    // vue的初始化
    this._init(options)
}

initMixin(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
initWatchMixin(Vue)

// 初始化全局的api
initGlobalAPI(Vue)

export default Vue