import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'NeoSDK',
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    outExtension: () => ({ js: '.global.min.js' }),
  },
]);
