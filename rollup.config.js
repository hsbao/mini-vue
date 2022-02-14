import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js', // 打包入口文件
	output: {
		file: 'dist/umd/vue.js', // 打包后的文件路径
		format: 'umd', // 统一模块规范
		name: 'Vue', // 指定打包后全局变量的名称
	},
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
		process.env.NODE_ENV === 'development' ? serve({
			open: true,
			openPage: '/public/index.html', // 默认打开的html的路径
			contentBase: '',
			port: 3000,
		}) : null
  ],
}
