import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react-native': 'src/react-native.ts',
    css: 'src/css.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist/js',
  splitting: true,
  sourcemap: true,
});
