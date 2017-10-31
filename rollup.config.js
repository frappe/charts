// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

export default [
	{
		input: 'src/scripts/charts.js',
		output: {
			file: 'dist/frappe-charts.min.js',
			format: 'iife',
		},
		name: 'Chart',
		sourcemap: 'true',
		plugins: [
			postcss({
				extensions: [ '.less' ],
				plugins: [
					nested(),
					cssnext({ warnForDuplicates: false }),
					cssnano()
				]
			}),
			eslint({
				exclude: [
					'src/styles/**',
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
		input: 'src/scripts/charts.js',
		output: {
			file: 'docs/assets/js/frappe-charts.min.js',
			format: 'iife',
		},
		name: 'Chart',
		sourcemap: 'false',
		plugins: [
			postcss({
				extensions: [ '.less' ],
				plugins: [
					nested(),
					cssnext({ warnForDuplicates: false }),
					cssnano()
				]
			}),
			eslint({
				exclude: [
					'src/styles/**',
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
