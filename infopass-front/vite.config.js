import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import __dirname from 'path';

// 👇 Rollup polyfill plugin 설치 필요
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  plugins: [
    react()
  ],
  preview: { port: 5173 },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    minify: 'esbuild',
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
      external: [],
    },
  },
  server: {
    host: '0.0.0.0',   // 모든 인터페이스 공개
    port: 5173         // 원하는 포트
  }
});
