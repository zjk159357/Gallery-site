import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const IMAGE_CDN_SUFFIX = '?w=2560&q=90&auto=format&fit=max'

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

/**
 * Ask Sanity which photo is the homepage hero and inject a preload link
 * so the browser can download it in parallel with the JS bundle.
 *
 * We use a hardcoded Sanity asset URL for the hero photo. If the hero
 * changes in the CMS (different photo, re-upload, etc.), update this URL
 * and rebuild. A stale preload is harmless — the browser just downloads
 * one extra image it won't use, and React chooses the real hero at
 * runtime based on the Sanity data.
 */
function heroPreloadPlugin(): Plugin {
  // Current hero: DSC_0257.JPG (石塘度假区)
  const heroUrl = 'https://cdn.sanity.io/images/zj2ik922/production/84010d241db624957eb22b4a39f61115a55f84be-6048x4032.jpg'

  return {
    name: 'hero-preload',
    apply: 'build',
    enforce: 'pre',
    transformIndexHtml(html) {
      const preconnect = '  <link rel="preconnect" href="https://cdn.sanity.io">\n'
      const preload = `  <link rel="preload" as="image" href="${heroUrl}${IMAGE_CDN_SUFFIX}" fetchpriority="high">\n`

      if (!html.includes('cdn.sanity.io')) {
        html = html.replace('</head>', `${preconnect}${preload}  </head>`)
      }

      return html
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dropWoffFallback(), heroPreloadPlugin()],
})
