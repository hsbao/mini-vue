import { initMixin } from './init'

function Vue(options) {
    // vue的初始化
    this._init(options)
}

initMixin(Vue)

export default Vue