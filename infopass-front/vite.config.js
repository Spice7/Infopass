import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 필요할 때만 사용 (사용 시 npm i buffer process)
      // buffer: 'buffer',
      // process: 'process/browser',
    },
  },
  plugins: [react()],
  preview: { port: 5173 },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(mode !== 'production'),
    __PROD__: JSON.stringify(mode === 'production'),
  },
  optimizeDeps: {
    // 실제로 필요할 때만 include
    // include: ['buffer', 'process'],
    esbuildOptions: {
      define: { global: 'globalThis' },
      target: 'es2020',
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2018',
    modulePreload: false,
    brotliSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
}));