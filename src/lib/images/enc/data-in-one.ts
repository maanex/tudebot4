import Image from 'image-js'
import { changeColorDepth, getPixelsArray } from '../image-util'


const MAX_BIT_DEPTH = 16
const BIT_PER_PIXEL = 8
const BIT_PER_PIXEL_MASK = (2 ** BIT_PER_PIXEL) - 1

export function encode(data: Buffer, dataType: string, as: Image, _pass = '') {
  const out = changeColorDepth(as, MAX_BIT_DEPTH)

  // TODO make image larger if data.length zu groß

  const typeBuff = Buffer.from(dataType.split('.').slice(-1)[0])
  const type = [ 0, 0, 0, 0, 0, 0 ]
  for (let i = 0; i < typeBuff.length; i++)
    type[i] = typeBuff.readUInt8(i)

  const meta = {
    version: 0x1,
    sizeHigh: (data.length) >> MAX_BIT_DEPTH,
    sizeLow: (data.length) & (2 ** MAX_BIT_DEPTH - 1),
    type
  }

  let bytesLeft = data.length

  const pixels = getPixelsArray(as)
  let index = 0
  for (const pixel of pixels) {
    if (index === 0) {
      pixel[0] = meta.version
      pixel[1] = meta.sizeHigh
      pixel[2] = meta.sizeLow
    } else if (index === 1) {
      pixel[0] = (type[0] << 8) | type[1]
      pixel[1] = (type[2] << 8) | type[3]
      pixel[2] = (type[4] << 8) | type[5]
    } else {
      pixel[0] = (pixel[0] << 8) | ((bytesLeft-- > 0) ? data.readUInt8(index * 3 - 6 + 0) : 0)
      pixel[1] = (pixel[1] << 8) | ((bytesLeft-- > 0) ? data.readUInt8(index * 3 - 6 + 1) : 0)
      pixel[2] = (pixel[2] << 8) | ((bytesLeft-- > 0) ? data.readUInt8(index * 3 - 6 + 2) : 0)
    }

    out.setPixel(index, pixel)
    index++
  }

  return Buffer.from(out.toBuffer({ format: 'png' }))
}


export function decode(inp: Image, _pass = ''): [ Buffer, string ] {
  const pixels = getPixelsArray(inp)
  const typeRaw = [ pixels[1][0], pixels[1][1], pixels[1][2] ]
    .map(p => [ p >> 8, p & 0xFF ]) // split each pixel in two values
    .flat() // flatten out
    .filter(p => !!p) // filter out 0x0 values
  const type = Buffer.alloc(typeRaw.length)
  for (let i = 0; i < typeRaw.length; i++)
    type.writeUInt8(typeRaw[i], i)

  const meta = {
    version: pixels[0][0],
    sizeHigh: pixels[0][1],
    sizeLow: pixels[0][2],
    size: (pixels[0][1] << MAX_BIT_DEPTH) | (pixels[0][2] & (2 ** MAX_BIT_DEPTH - 1)),
    type: type.toString()
  }

  const out = Buffer.alloc(meta.size)
  let bytesLeft = meta.size

  let index = 0
  for (const pixel of pixels) {
    if (index <= 1) {
      index++
      continue
    }

    if (bytesLeft-- > 0) out.writeUInt8(pixel[0] & BIT_PER_PIXEL_MASK, index * 3 - 6 + 0)
    if (bytesLeft-- > 0) out.writeUInt8(pixel[1] & BIT_PER_PIXEL_MASK, index * 3 - 6 + 1)
    if (bytesLeft-- > 0) out.writeUInt8(pixel[2] & BIT_PER_PIXEL_MASK, index * 3 - 6 + 2)

    if (bytesLeft < 0) break
    index++
  }

  return [ out, meta.type ]
}
