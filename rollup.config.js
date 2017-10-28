// Rollup plugins
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

export default {
  input: 'src/charts.js',
  output: {
	file: 'dist/frappe-charts.min.js',
	format: 'iife',
  },
  name: 'Chart',
  sourcemap: 'inline',
  plugins: [
	resolve(),
	eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
