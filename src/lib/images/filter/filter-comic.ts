import { Image } from 'image-js'


export default function (input): Promise<Buffer> {
  const image = new Image(input.width, input.height)
  const pixels = input.getPixelsArray()
  const ratios = new Array(pixels.length).fill(-1)
  const levels = 9
  const halfl = levels / 2
  const borderCheck = [[ 1, 0 ], [ 0, 1 ], [ 2, 0 ], [ 0, 2 ], [ 1, 1 ], [ 3, 0 ], [ 0, 3 ], [ 2, 1 ], [ 1, 2 ], [ 2, 2 ]]
  const w = image.width
  const h = image.height

  let ratio
  let temp
  let tempB
  let tempC
  let color
  let x
  let y

  for (let i = 0; i < pixels.length; i++) {
    x = i % w
    y = ~~(i / w)

    ratio = getLevel(pixels, ratios, x, y, w, h, 6, levels)

    color = easeInOutQuad(ratio / levels) * 255

    for (const c of borderCheck) {
      if (x + c[0] >= w || y + c[1] >= h) continue

      temp = getLevel(pixels, ratios, x + c[0], y + c[1], w, h, 4, levels)
      if (Math.abs(ratio - temp) >= 2) {
        color += 50
        break
      }

      tempB = pixels[i]
      tempC = pixels[(y + c[1]) * w + (x + c[0])]
      temp = Math.abs(tempB[0] - tempC[0]) + Math.abs(tempB[1] - tempC[1]) + Math.abs(tempB[2] - tempC[2])
      if (temp > 100) {
        color += 50
        break
      }
    }

    if (rasterCheck(x, y, ~~(Math.abs(ratio - halfl) * 8)))
      color += (ratio > halfl ? 1 : -1) * 30

    if (color < 0) color = 0
    if (color > 255) color = 255

    image.setPixel(i, [ color, color, color ])
  }

  return Promise.resolve(Buffer.from(image.toBuffer({ format: 'png' })))
}

//

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function getLevel(pixels, cache, x, y, w, h, range, levelCount) {
  if (cache[y * w + x] >= 0) return cache[y * w + x]

  let dxAbs; let ratio; let pix; const levels = new Array(levelCount).fill(0)
  for (let dx = -range; dx <= range; dx++) {
    dxAbs = Math.abs(dx)
    for (let dy = -range + dxAbs; dy <= range - dxAbs; dy++) {
      if (x + dx < 0) continue
      if (y + dy < 0) continue
      if (x + dx >= w) continue
      if (y + dy >= h) continue
      pix = pixels[(y + dy) * w + (x + dx)]
      ratio = (pix[0] + pix[1] + pix[2]) / 3 / 256
      levels[~~(ratio * levelCount)]++
    }
  }

  let out = 0
  ratio = 0
  for (let i = 0; i < levels.length; i++) {
    if (levels[i] <= ratio) continue
    ratio = levels[i]
    out = i
  }
  cache[y * w + x] = out
  return out
}

function rasterCheck(x, y, size) {
  return (x % 16 < size && y % 16 < size)
    || (((x + 8) % 16 < size && (y + 8) % 16 < size))
}
