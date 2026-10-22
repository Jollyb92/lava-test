import fs from 'node:fs'
import path from 'node:path'

// Dev-server only: serves the files of a local or network folder under a URL
// prefix, read straight from disk, so no separate file server or port is needed.

const TYPES = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg' }

export default function folderPlugin(prefix, dir) {
  const root = path.resolve(dir)
  return {
    name: `lava-folder${prefix}`,
    configureServer(server) {
      server.middlewares.use(prefix, (req, res, next) => {
        const rel = decodeURIComponent(req.url.split('?')[0])
        const file = path.resolve(root, '.' + rel)
        // Never serve anything outside the folder
        if (!file.startsWith(root + path.sep)) return next()
        fs.stat(file, (err, stat) => {
          if (err || !stat.isFile()) {
            res.statusCode = 404
            res.end(`Not found: ${file}`)
            return
          }
          res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream')
          res.setHeader('Content-Length', stat.size)
          res.setHeader('Cache-Control', 'no-cache')
          fs.createReadStream(file).pipe(res)
        })
      })
    },
  }
}
