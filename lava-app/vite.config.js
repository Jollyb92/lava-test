import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => ({
  plugins: [react(), viteSingleFile()],
  base: './',
  server: {
    host: true,
    proxy: {
      '/pdf-server': {
        target: 'http://localhost:3000',
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
}))
