import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Root path for Netlify
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
