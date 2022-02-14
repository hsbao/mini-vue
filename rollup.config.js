import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js',
	output: {
		file: 'dist/umd/vue.js',
		format: 'umd',
		name: 'Vue',
	},
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
		process.env.NODE_ENV === 'development' ? serve({
			open: true,
			openPage: '/public/index.html',
			contentBase: '',
			port: 3000,
		}) : null
  ],
}
