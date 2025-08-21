import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 Rollup polyfill plugin 설치 필요
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // ✅ 이 줄이 핵심입니다!
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
  server: {
    proxy: {
      "/ws-game": "http://localhost:9000",
      "/api": "http://localhost:9000",
    },
  },
});
