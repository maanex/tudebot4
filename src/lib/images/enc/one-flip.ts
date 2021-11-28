import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'
import { grabbit, makeMap, rand } from './enc-util'


export function oneFlip(image: Image, password: string): Buffer {
  const pixels = getPixelsArray(image)
  const map = makeMap(password, 24)

  let index = 0
  for (const pixel of pixels) {
    const flippo = rand(password, 0xFFFFFF, index * 1.5)
    const outPixOne = (pixel[0] & 0xFF) << 16 | (pixel[1] & 0xFF) << 8 | (pixel[2] & 0xFF)
    const inPixOne = (pixel[0] & 0xFF00) << 8 | (pixel[1] & 0xFF00) | (pixel[2] & 0xFF00) >> 8
    const outOne = grabbit(outPixOne, map) ^ flippo
    const inOne = grabbit(inPixOne ^ flippo, map)

    pixel[0] = ((outOne >> 16) & 0xFF) << 8 | ((inOne >> 16) & 0xFF)
    pixel[1] = ((outOne >> 8) & 0xFF) << 8 | ((inOne >> 8) & 0xFF)
    pixel[2] = ((outOne >> 0) & 0xFF) << 8 | ((inOne >> 0) & 0xFF)
    image.setPixel(index, pixel)
    index++
  }

  return Buffer.from((image as Image).toBuffer({ format: 'png' }))
}
