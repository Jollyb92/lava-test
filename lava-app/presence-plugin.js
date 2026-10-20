import os from 'node:os'
import dns from 'node:dns/promises'
import process from 'node:process'

// Dev-server only: counts the PCs that have the app open (each open tab keeps
// a Vite HMR websocket), prints join/leave rows in the Vite window, keeps the
// window title updated with users + CPU/RAM, and pushes the count to the app.

const EVENT = 'lava:presence'
const LEAVE_GRACE_MS = 4000 // a page reload is not a leave + join
const TITLE_EVERY_MS = 5000

const LOOPBACK = new Set(['127.0.0.1', '::1'])

function ownIps() {
  return new Set(
    Object.values(os.networkInterfaces()).flat().map(i => i.address)
  )
}

function shortName(name) {
  return name.split('.')[0].toLowerCase()
}

async function lookupName(ip) {
  const timeout = new Promise(resolve => setTimeout(resolve, 3000, null))
  const lookup = dns
    .lookupService(ip, 0)
    .then(r => (r.hostname && r.hostname !== ip ? r.hostname : null))
    .catch(() => dns.reverse(ip).then(names => names[0] ?? null))
    .catch(() => null)
  const name = await Promise.race([lookup, timeout])
  return name ? shortName(name) : null
}

// ── Resource usage ────────────────────────────────────────────────────────────

function cpuTotals() {
  let idle = 0, total = 0
  for (const { times } of os.cpus()) {
    idle += times.idle
    total += times.user + times.nice + times.sys + times.idle + times.irq
  }
  return { idle, total }
}

function createResourceMeter() {
  let lastCpu = cpuTotals()
  let lastProc = process.cpuUsage()
  let lastAt = process.hrtime.bigint()
  let latest = null

  function sample() {
    const cpu = cpuTotals()
    const proc = process.cpuUsage()
    const now = process.hrtime.bigint()

    const totalDelta = cpu.total - lastCpu.total
    const pcCpu = totalDelta > 0 ? 100 * (1 - (cpu.idle - lastCpu.idle) / totalDelta) : 0
    // process.cpuUsage is in µs; spread over all cores to match the PC figure
    const elapsedUs = Number(now - lastAt) / 1000
    const procUs = (proc.user - lastProc.user) + (proc.system - lastProc.system)
    const appCpu = elapsedUs > 0 ? (100 * procUs) / (elapsedUs * os.cpus().length) : 0

    lastCpu = cpu; lastProc = proc; lastAt = now
    latest = {
      appCpu,
      appRamMb: process.memoryUsage().rss / 1024 / 1024,
      pcCpu,
      pcRamUsedGb: (os.totalmem() - os.freemem()) / 1024 ** 3,
      pcRamTotalGb: os.totalmem() / 1024 ** 3,
    }
    return latest
  }

  return { sample, latest: () => latest ?? sample() }
}

function formatResources(r) {
  return (
    `app: CPU ${r.appCpu.toFixed(0)}%, RAM ${r.appRamMb.toFixed(0)} MB | ` +
    `PC: CPU ${r.pcCpu.toFixed(0)}%, RAM ${r.pcRamUsedGb.toFixed(1)}/${r.pcRamTotalGb.toFixed(0)} GB`
  )
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export default function presencePlugin() {
  return {
    name: 'lava-presence',
    apply: 'serve',
    configureServer(server) {
      const self = shortName(os.hostname())
      const local = ownIps()
      const meter = createResourceMeter()

      const tabs = new Map()        // ip -> number of open tabs
      const names = new Map()       // ip -> PC name (or the ip if unknown)
      const leaveTimers = new Map() // ip -> pending "left" timer

      const online = () => [...tabs.keys()].map(ip => names.get(ip) ?? ip)

      function snapshot() {
        return { count: tabs.size, users: online().sort() }
      }

      function log(sign, ip, verb) {
        const name = names.get(ip) ?? ip
        const who = name === ip ? ip : `${name} (${ip})`
        const list = online().sort().join(', ') || '-'
        server.config.logger.info(
          `${sign} ${who} ${verb} - ${tabs.size} online: ${list}\n    ${formatResources(meter.sample())}`,
          { timestamp: true }
        )
      }

      function updateTitle() {
        const users = tabs.size === 1 ? '1 user' : `${tabs.size} users`
        process.title = `LAVA App - ${users} - ${formatResources(meter.sample())}`
      }

      function broadcast() {
        server.ws.send(EVENT, snapshot())
        updateTitle()
      }

      server.ws.on('connection', (socket, req) => {
        let ip = (req.socket.remoteAddress ?? 'unknown').replace(/^::ffff:/, '')
        if (LOOPBACK.has(ip) || local.has(ip)) ip = 'this PC'
        if (ip === 'this PC') names.set(ip, self)

        const pending = leaveTimers.get(ip)
        if (pending) {
          clearTimeout(pending)
          leaveTimers.delete(ip)
        }

        const isNew = !tabs.has(ip)
        tabs.set(ip, (tabs.get(ip) ?? 0) + 1)
        if (isNew && !pending) {
          const announce = () => { log('+', ip, 'joined'); broadcast() }
          if (names.has(ip)) announce()
          else lookupName(ip).then(name => { names.set(ip, name ?? ip); announce() })
        }

        socket.on('close', () => {
          const left = (tabs.get(ip) ?? 1) - 1
          // Keep the PC listed with 0 tabs during the grace period
          tabs.set(ip, left)
          if (left > 0) return
          leaveTimers.set(ip, setTimeout(() => {
            leaveTimers.delete(ip)
            if (tabs.get(ip) !== 0) return
            tabs.delete(ip)
            log('-', ip, 'left')
            broadcast()
          }, LEAVE_GRACE_MS))
        })
      })

      // A page asks for the current count once it has mounted
      server.ws.on(`${EVENT}:hello`, (_data, client) => client.send(EVENT, snapshot()))

      updateTitle()
      const titleTimer = setInterval(updateTitle, TITLE_EVERY_MS)
      server.httpServer?.on('close', () => clearInterval(titleTimer))
    },
  }
}
