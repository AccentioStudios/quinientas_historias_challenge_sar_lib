import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import pkg from './package.json' assert { type: "json" };
export default [
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/sarlib.mjs',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			commonjs({
				include: 'node_modules/**',
				extensions: [ '.js', '.cjs' ],
				ignoreGlobal: false,
			}),
			babel({
				exclude: 'node_modules/**',
			}),
			terser(),
		]
	}
];
