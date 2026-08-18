import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',                  // Railway는 루트 경로. 하위 경로 아님
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,     // 삽화 PNG를 base64로 인라인하지 않게
  },
})
