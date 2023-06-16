import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: "json" };

export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: 'sarlib',
			file: pkg.browser,
			format: 'umd',
			sourcemap: true,
		},
		plugins: [
			nodeResolve({
				browser: true,
				ignoreGlobal: false,
			}),
			commonjs({
				extensions: [ '.js', '.cjs' ],
				ignoreGlobal: false,
			}),
			terser(),
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/main.js',
		external: ['toastify-js'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			commonjs(),
			terser(),
		]
	}
];
