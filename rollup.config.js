import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

const global = '$';
const terserOptions = {
  mangle: {
    properties: {
      regex: /^(_syncs|_update)$/,
    },
  },
};

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
        plugins: [terser(terserOptions)]
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
        plugins: [terser(terserOptions)]
      },
      {
        file: './dist/hamaca.mjs.js',
        format: 'es',
        plugins: [terser(terserOptions)]
      }
    ],
    plugins: [
      commonjs()
    ]
  }
];