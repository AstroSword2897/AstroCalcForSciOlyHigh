import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'scripts'),
      '@ui': resolve(__dirname, 'scripts/ui'),
      '@types': resolve(__dirname, 'scripts/types')
    }
  },
  server: {
    port: 8000,
    open: true
  }
});

