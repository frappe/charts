// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default {
	input: 'src/scripts/charts.js',
	output: {
		file: 'dist/frappe-charts.min.js',
		format: 'iife',
	},
	name: 'Chart',
	sourcemap: 'true',
	plugins: [
		eslint(),
		babel({
			exclude: 'node_modules/**',
		}),
		uglify()
	],
};
