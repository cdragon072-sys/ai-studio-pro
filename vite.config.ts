import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // GRS AI 海外节点代理 - 解决 CORS
      '/proxy/grsai': {
        target: 'https://grsaiapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/grsai/, ''),
        secure: true,
      },
      // GRS AI 国内节点代理
      '/proxy/grsai-cn': {
        target: 'https://grsai.dakka.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/grsai-cn/, ''),
        secure: true,
      },
      // DeepSeek API 代理
      '/proxy/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/deepseek/, ''),
        secure: true,
      },
    },
  },
})
