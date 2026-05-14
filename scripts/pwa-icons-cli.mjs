import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderPwaIconsFromSvg } from './render-pwa-icons.mjs'

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

renderPwaIconsFromSvg(publicDir).then(() => {
  console.log('PWA icons OK:', path.join(publicDir, 'icons'))
})
