// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/charts.js',
  dest: 'dist/frappe-charts.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
