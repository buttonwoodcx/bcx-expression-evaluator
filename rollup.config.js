import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'BcxExpressionEvaluator',
    file: 'dist/index.js',
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    terser()
  ]
};
