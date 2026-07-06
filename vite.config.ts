import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function lastUpdatedPlugin(): Plugin {
  const srcDir = join(process.cwd(), 'src')
  const trackedExt = /\.(tsx?|css|html)$/

  const findLatestMtime = (dir: string): number => {
    let max = 0
    let entries: { name: string; isFile: boolean }[]
    try {
      entries = readdirSync(dir, { withFileTypes: true }).map((d) => ({
        name: d.name,
        isFile: d.isFile(),
      }))
    } catch {
      return max
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (!entry.isFile) {
        const sub = findLatestMtime(full)
        if (sub > max) max = sub
      } else if (trackedExt.test(entry.name)) {
        const m = statSync(full).mtimeMs
        if (m > max) max = m
      }
    }
    return max
  }

  return {
    name: 'last-updated',
    config() {
      const mtime = findLatestMtime(srcDir)
      const iso = mtime > 0 ? new Date(mtime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
      return {
        define: {
          __LAST_UPDATED__: JSON.stringify(iso),
        },
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), lastUpdatedPlugin()],
})