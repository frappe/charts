// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify-es';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

import pkg from './package.json';

export default [
	{
		input: 'src/js/charts.js',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
			},
			{
				file: pkg.module,
				format: 'es',
			}
		],
		plugins: [
			postcss({
				extensions: [ '.scss' ],
				extract: 'dist/frappe-charts.min.css',
				plugins: [
					nested(),
					cssnext({ warnForDuplicates: false }),
					cssnano()
				]
			}),
			eslint({
				exclude: [
					'src/scss/**',
				]
			}),
			babel({
				exclude: 'node_modules/**',
			}),
			replace({
				exclude: 'node_modules/**',
				ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
			uglify()
		],
	},
	{
		input: 'src/js/charts.js',
		output: [
			{
				file: pkg.src,
				format: 'es',
			}
		],
		plugins: [
			postcss({
				extensions: [ '.scss' ],
				extract: 'dist/frappe-charts.min.css',
				plugins: [
					nested(),
					cssnext({ warnForDuplicates: false }),
					cssnano()
				]
			}),
			eslint({
				exclude: [
					'src/scss/**',
				]
			}),
			replace({
				exclude: 'node_modules/**',
				ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			})
		],
	},
	{
		input: 'src/js/charts.js',
		output: [
			{
				file: 'docs/assets/js/frappe-charts.min.js',
				format: 'iife',
			},
			{
				file: pkg.browser,
				format: 'iife',
			}
		],
		name: 'Chart',
		plugins: [
			postcss({
				extensions: [ '.scss' ],
				plugins: [
					nested(),
					cssnext({ warnForDuplicates: false }),
					cssnano()
				]
			}),
			eslint({
				exclude: [
					'src/scss/**',
				]
			}),
			babel({
				exclude: 'node_modules/**',
			}),
			replace({
				exclude: 'node_modules/**',
				ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
			uglify()
		],
	}
];
