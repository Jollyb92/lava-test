import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'url'
import os from 'os'
import presencePlugin from './presence-plugin.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  return {
    plugins: [react(), viteSingleFile(), presencePlugin()],
    base: './',
    server: {
      host: true,
      // Fixed port so the shared link never silently moves to 5174
      port: 5173,
      strictPort: true,
      // Let colleagues open http://<this-PC-name>:5173/ (the name survives IP changes)
      allowedHosts: [os.hostname().toLowerCase()],
      proxy: {
        '/pdf-server': {
          target: env.PDF_SERVER || 'http://127.0.0.1:3000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/pdf-server/, ''),
        },
        // \\lava-b-stor01\LIBRARY\4_GENERAL OFFICE\91_BER\Administrative Forms
        '/pdf-forms': {
          target: env.PDF_FORMS_SERVER || 'http://127.0.0.1:3001',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/pdf-forms/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '#pdf-sources': fileURLToPath(
          new URL(
            mode === 'offline' ? './src/pdfSources.offline.js' : './src/pdfSources.dev.js',
            import.meta.url
          )
        ),
      },
    },
    ...(mode === 'offline' && {
      assetsInlineLimit: 50 * 1024 * 1024,
    }),
  }
})
