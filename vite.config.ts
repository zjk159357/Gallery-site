import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Drop .woff fallback @font-face sources AND their asset files.
 *
 * @fontsource emits both woff and woff2 sources for every face. Modern
 * browsers (98%+) support woff2; the woff fallback is dead weight
 * (≈half the font bytes) for our audience. Woff is kept in the dev
 * build so older debugging browsers still see the fonts, but only
 * woff2 reaches production.
 */
function dropWoffFallback(): Plugin {
  return {
    name: 'drop-woff-fallback',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const woffUrl = /url\([^)]*\.woff(?:[?#][^)]*)?\)\s*format\(['"]woff['"]\)\s*,?\s*/gi
      const woffAssets = new Set<string>()
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && typeof file.source === 'string' && file.fileName.endsWith('.css')) {
          const before = file.source.length
          file.source = file.source.replace(woffUrl, (match) => {
            const urlMatch = match.match(/url\(([^)]*)\)/)
            if (urlMatch) woffAssets.add(urlMatch[1].replace(/^["']|["']$/g, ''))
            return ''
          })
          if (file.source.length !== before) {
            file.source = file.source.replace(/,(\s*})/g, '$1').replace(/;\s*}/g, '}')
          }
        }
      }
      for (const fileName of Object.keys(bundle)) {
        const baseName = fileName.split('?')[0].split('#')[0]
        if (baseName.endsWith('.woff') && !baseName.endsWith('.woff2')) {
          for (const ref of woffAssets) {
            if (fileName === ref || fileName.endsWith(ref) || ref.endsWith(fileName)) {
              delete bundle[fileName]
              break
            }
          }
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dropWoffFallback()],
})
