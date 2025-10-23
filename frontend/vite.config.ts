import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // 일부 Windows/IDE 환경에서 파일 변경 감지가 되지 않는 경우가 있어
    // 폴링 기반 감지를 활성화하여 저장 시 화면에 바로 반영되도록 합니다.
    watch: {
      usePolling: true,
      interval: 300,
    },
    // 로컬 개발에서 HMR(WebSocket) 연결 포트를 명시합니다.
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
