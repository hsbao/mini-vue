# mini-vue

## 文件目录
```js
├── index.js  
├── init.js
├── lifecycle.js
├── render.js
├── state.js
└── compiler
    ├── index.js
    ├── generate.js
    ├── parse-html.js
└── observe
    ├── index.js
    ├── array.js
    ├── watcher.js
└── utils
    ├── index.js
└── vdom
    ├── create-element.js
    └── tests  测试相关
```

## index.js
Vue的入口文件，当实例化Vue的时候，会进行初始化操作。内部会调用各种mixin方法给Vue的原型上添加方法
1. initMixin：在Vue原型上添加初始化方法
2. renderMixin：在Vue原型上添加渲染方法，调用render方法拿到VNode      --> render.js
3. lifecycleMixin：在Vue原型上添加_update方法，将VNode转换成真实DOM  --> lifecycle.js

## 其他目录
1. compiler 将template字符串转换成ast语法树 --> 生成render方法
2. observe 数据观测，响应式原理的实现
3. vdom 调用render方法生成VNode，以及将VNode渲染成真实DOM