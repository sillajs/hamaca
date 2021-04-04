import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

const global = '$_';

export default [
  {
    input: './index.js',
    output: [
      {
        file: './dist/hamaca.js',
        format: 'iife',
        name: global
      },
      {
        file: './dist/hamaca.min.js',
        format: 'iife',
        name: global,
        plugins: [terser()]
      }
    ],
    plugins: [
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: './index.js',
    output: [
      {
        file: './dist/hamaca.es.js',
        format: 'iife',
        name: global
      },
      {
        file: './dist/hamaca.es.min.js',
        format: 'iife',
        name: global,
        plugins: [terser()]
      },
      {
        file: './dist/hamaca.mjs.js',
        format: 'es',
        plugins: [terser()]
      }
    ],
    plugins: [
      commonjs()
    ]
  }
];