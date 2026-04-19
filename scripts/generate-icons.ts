#!/usr/bin/env node
// Generates every PWA icon (any + maskable + monochrome) and Apple
// splash screens from design/icon-master.svg. Run via `pnpm icons`.
//
// Output:
//   public/icons/icon-{192,512,maskable-512,monochrome-512}.png
//   public/icons/apple-touch-icon-{120,152,167,180}.png
//   public/icons/favicon-{16,32}.png
//   public/icons/og-image-1200.png
//   public/splash/iphone-*.png (a curated set of sizes)

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MASTER = path.join(ROOT, 'design/icon-master.svg')
const ICON_DIR = path.join(ROOT, 'public/icons')
const SPLASH_DIR = path.join(ROOT, 'public/splash')

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function renderSquare(
  svgBuffer: Buffer,
  size: number,
  outPath: string,
  options: { background?: string; pad?: number } = {},
) {
  const { background = '#14100D', pad = 0 } = options
  const inner = size - pad * 2
  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
  const icon = await sharp(svgBuffer).resize(inner, inner).png().toBuffer()
  await base
    .composite([{ input: icon, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function renderMonochrome(svgBuffer: Buffer, size: number, outPath: string) {
  // Monochrome uses a white-on-transparent render so the OS can tint it.
  const rewritten = svgBuffer
    .toString('utf8')
    // Replace the named palette with white-translucent.
    .replace(/#E53228|#AB2922|#46A06E|#367C56|#F4ECE0/gi, '#FFFFFF')
    .replace(/<rect[^/]*\/>/, '<rect width="1024" height="1024" fill="transparent"/>')
    .replace(/url\(#glow\)/g, 'rgba(255, 255, 255, 0.25)')
  const buf = Buffer.from(rewritten, 'utf8')
  await sharp(buf).resize(size, size).png().toFile(outPath)
}

async function renderOgImage(svgBuffer: Buffer, outPath: string) {
  const width = 1200
  const height = 630
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#14100D',
    },
  })
  const iconSize = 440
  const icon = await sharp(svgBuffer).resize(iconSize, iconSize).png().toBuffer()
  const text = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="transparent"/>
      <text x="${iconSize + 160}" y="330" font-family="Archivo, Helvetica, sans-serif" font-size="88" font-weight="800" fill="#F4ECE0" letter-spacing="-2">
        One<tspan fill="#E53228">·</tspan>Two<tspan fill="#46A06E">·</tspan>One
      </text>
      <text x="${iconSize + 160}" y="400" font-family="Menlo, monospace" font-size="28" fill="rgba(244,236,224,0.6)" letter-spacing="2">
        DARTS PRACTICE
      </text>
    </svg>`,
    'utf8',
  )
  await background
    .composite([
      { input: icon, top: (height - iconSize) / 2, left: 80 },
      { input: text, top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function renderSplash(
  svgBuffer: Buffer,
  width: number,
  height: number,
  outPath: string,
) {
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#14100D',
    },
  })
  const iconSize = Math.min(width, height) * 0.42
  const icon = await sharp(svgBuffer).resize(Math.round(iconSize), Math.round(iconSize)).png().toBuffer()
  await background
    .composite([
      {
        input: icon,
        top: Math.round((height - iconSize) / 2),
        left: Math.round((width - iconSize) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function main() {
  const svg = await fs.readFile(MASTER)
  await ensureDir(ICON_DIR)
  await ensureDir(SPLASH_DIR)

  // Standard icons (any purpose)
  await renderSquare(svg, 192, path.join(ICON_DIR, 'icon-192.png'))
  await renderSquare(svg, 512, path.join(ICON_DIR, 'icon-512.png'))

  // Maskable — add ~10% safe-zone padding so the mask doesn't clip the ring.
  await renderSquare(svg, 512, path.join(ICON_DIR, 'icon-maskable-512.png'), { pad: 60 })

  // Monochrome variant (for Android theming / Apple mask-icon fallbacks)
  await renderMonochrome(svg, 512, path.join(ICON_DIR, 'icon-monochrome-512.png'))

  // Apple touch icons
  for (const size of [120, 152, 167, 180]) {
    await renderSquare(svg, size, path.join(ICON_DIR, `apple-touch-icon-${size}.png`))
  }

  // Favicons
  await renderSquare(svg, 16, path.join(ICON_DIR, 'favicon-16.png'))
  await renderSquare(svg, 32, path.join(ICON_DIR, 'favicon-32.png'))

  // OG image (social preview)
  await renderOgImage(svg, path.join(ICON_DIR, 'og-image-1200.png'))

  // Apple splash screens — a curated set covering common device sizes.
  const splashSizes: [number, number, string][] = [
    [1284, 2778, 'iphone-pro-max'],
    [1170, 2532, 'iphone-pro'],
    [1179, 2556, 'iphone-15-pro'],
    [1125, 2436, 'iphone-x'],
    [828, 1792, 'iphone-11'],
    [750, 1334, 'iphone-se'],
  ]
  for (const [w, h, slug] of splashSizes) {
    await renderSplash(svg, w, h, path.join(SPLASH_DIR, `${slug}.png`))
  }

  console.log('✓ Icons generated in public/icons/')
  console.log('✓ Splash screens generated in public/splash/')
}

await main()
