/**
 * 生成 app-192.png / app-512.png / apple-touch-icon.png：
 * 1) app-source.png：先放大栅格 → 铺底去透明 → trim 去白边 → cover 到目标（图案更大、少留白）
 * 2) app-icon.svg：同上流程
 * 3) sharp 不可用时回退为纯色占位
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const BG = { r: 249, g: 247, b: 242, alpha: 1 }

function crc32(buf) {
  let c = ~0 >>> 0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : c >>> 1
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'binary')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function makeSolidPng(width, height, r, g, b) {
  const rowLen = 1 + width * 3
  const raw = Buffer.alloc(rowLen * height)
  let o = 0
  for (let y = 0; y < height; y++) {
    raw[o++] = 0
    for (let x = 0; x < width; x++) {
      raw[o++] = r
      raw[o++] = g
      raw[o++] = b
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

function writeFallbackPngs(iconsDir) {
  const R = BG.r
  const G = BG.g
  const B = BG.b
  fs.mkdirSync(iconsDir, { recursive: true })
  fs.writeFileSync(path.join(iconsDir, 'app-192.png'), makeSolidPng(192, 192, R, G, B))
  fs.writeFileSync(path.join(iconsDir, 'app-512.png'), makeSolidPng(512, 512, R, G, B))
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), makeSolidPng(180, 180, R, G, B))
  console.warn('[pwa-icons] sharp 不可用或渲染失败，已写入与图标底接近的纯色占位 PNG')
}

/**
 * 先高分辨率栅格化，flatten + trim 去掉白边/透明边，再 cover 到目标尺寸，让内容尽量铺满。
 */
async function toSquareAppIcon(shSharp, inputPath, destPath, outSize) {
  const pngOpts = { compressionLevel: 9, effort: 10 }
  const oversample = 1024

  const raster = await shSharp(inputPath)
    .rotate()
    .resize(oversample, oversample, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer()

  let mid = shSharp(raster).flatten({ background: BG })
  try {
    mid = mid.trim({ threshold: 42 })
  } catch {
    /* 部分图 trim 失败则跳过 */
  }

  await mid
    .resize(outSize, outSize, { fit: 'cover', position: 'center' })
    .png(pngOpts)
    .toFile(destPath)
}

/**
 * @param {string} publicDir 项目 public 根目录
 */
export async function renderPwaIconsFromSvg(publicDir) {
  const iconsDir = path.join(publicDir, 'icons')
  const svgPath = path.join(iconsDir, 'app-icon.svg')
  fs.mkdirSync(iconsDir, { recursive: true })

  if (!fs.existsSync(svgPath) && !fs.existsSync(path.join(iconsDir, 'app-source.png'))) {
    console.warn('[pwa-icons] 缺少 app-icon.svg 与 app-source.png')
    writeFallbackPngs(iconsDir)
    return
  }

  let sharp
  try {
    const mod = await import('sharp')
    sharp = mod.default
  } catch {
    writeFallbackPngs(iconsDir)
    return
  }

  const sourcePng = path.join(iconsDir, 'app-source.png')

  try {
    if (fs.existsSync(sourcePng)) {
      await toSquareAppIcon(sharp, sourcePng, path.join(iconsDir, 'app-192.png'), 192)
      await toSquareAppIcon(sharp, sourcePng, path.join(iconsDir, 'app-512.png'), 512)
      await toSquareAppIcon(sharp, sourcePng, path.join(iconsDir, 'apple-touch-icon.png'), 180)
      return
    }

    await toSquareAppIcon(sharp, svgPath, path.join(iconsDir, 'app-192.png'), 192)
    await toSquareAppIcon(sharp, svgPath, path.join(iconsDir, 'app-512.png'), 512)
    await toSquareAppIcon(sharp, svgPath, path.join(iconsDir, 'apple-touch-icon.png'), 180)
  } catch (e) {
    console.warn('[pwa-icons] 图标栅格化失败:', e)
    writeFallbackPngs(iconsDir)
  }
}
