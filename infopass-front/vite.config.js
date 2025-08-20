import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 👇 Rollup polyfill plugin 설치 필요
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // ✅ 이 줄이 핵심입니다!
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
  server: {
    host: '0.0.0.0',   // 모든 인터페이스 공개
    port: 5173         // 원하는 포트
  }
});
