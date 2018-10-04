import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'BcxExpressionEvaluator',
    file: 'dist/index.js',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    terser()
  ]
};
