import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'ExpressionEvaluator',
  dest: 'dist/index.js',
  external: [],
  globals: {},
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify()
  ]
};
