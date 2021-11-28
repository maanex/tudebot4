import { Image } from 'image-js'
import { changeColorDepth, getPixelsArray } from '../image-util'
import { grabbit, makeMap, rand } from './enc-util'


export function oneOutOfOne(input: Image, password: string): Buffer {
  const out = changeColorDepth(input, 8)

  const pixels = getPixelsArray(input)
  const map = makeMap(password, 24)

  let index = 0
  for (const pixel of pixels) {
    const flippo = rand(password, 0xFFFFFF, index * 1.5)
    const dispixOne = (pixel[0] & 0xFF) << 16
                    | (pixel[1] & 0xFF) << 8
                    | (pixel[2] & 0xFF)
    const outOne = grabbit(dispixOne, map) ^ flippo

    pixel[0] = (outOne >> 16) & 0xFF
    pixel[1] = (outOne >> 8) & 0xFF
    pixel[2] = (outOne >> 0) & 0xFF
    out.setPixel(index, pixel)
    index++
  }

  return Buffer.from((out as Image).toBuffer({ format: 'png' }))
}
