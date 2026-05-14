import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/postcss'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    {
      name: 'ledger-render-pwa-icons',
      async buildStart() {
        const { renderPwaIconsFromSvg } = await import('./scripts/render-pwa-icons.mjs')
        await renderPwaIconsFromSvg(path.join(root, 'public'))
      },
    },
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      /** Web App Manifest 使用仓库内 public/manifest.webmanifest，避免与插件生成双份 */
      manifest: false,
      includeAssets: ['vite.svg', 'manifest.webmanifest', 'icons/app-192.png', 'icons/app-512.png', 'icons/apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss({ base: root })],
    },
  },
})
