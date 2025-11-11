import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'node:path'

// Node 내장 모듈 'path'는 export = 형태이므로 default import 시 TS1259 오류가 발생합니다.
// esModuleInterop 없이 사용하기 위해 네임스페이스 임포트(import * as path)로 사용합니다.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 경로 별칭 설정: import 경로를 짧고 일관되게 사용합니다. (tsconfig.json의 paths와 동일하게 유지)
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
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
      // Frontend → Backend API proxy for local dev only
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
