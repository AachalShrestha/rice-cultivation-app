import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
console.log('VITE CONFIG LOADED')
export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: true,
    host: true,
    allowedHosts: ['localhost', 'brandon.trycloudflare.com', 'trycloudflare.com'],
  },
})
