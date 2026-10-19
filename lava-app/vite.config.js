import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  return {
    plugins: [react(), viteSingleFile()],
    base: './',
    server: {
      host: true,
      proxy: {
        '/pdf-server': {
          target: env.PDF_SERVER || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/pdf-server/, ''),
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
