import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/presage-bridge': {
        target: 'ws://127.0.0.1:8765',
        ws: true,
        rewriteWsOrigin: true
      }
    }
  }
});
