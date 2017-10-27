import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  name: 'BcxExpressionEvaluator',
  output: {
    format: 'umd',
    file: 'dist/index.js',
  },
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
