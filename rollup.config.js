import pkg from './package.json';

import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import scss from 'rollup-plugin-scss';
import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';


export default [
	// browser-friendly UMD build
	{
		input: 'src/js/index.js',
		output: {
			sourcemap: true,
			name: 'frappe-charts',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			commonjs(),
			babel({
				exclude: ['node_modules/**']
			}),
			terser(),
			scss({ output: 'dist/frappe-charts.min.css' }),
			bundleSize()
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	{
		input: 'src/js/chart.js',
		output: [
			{ file: pkg.common, format: 'cjs', sourcemap: true },
			{ file: pkg.module, format: 'es', sourcemap: true },
		],
		plugins: [
			babel({
				exclude: ['node_modules/**']
			}),
			terser(),
			postcss(),
			bundleSize()
		]
	}
];