import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'
import { cyrb128, sfc32 } from './enc-util'


export function oneFlip(image: Image, password: string): Buffer {
  const pixels = getPixelsArray(image)
  const seed = cyrb128(password)

  let pixel: number[]
  let bits: number
  let mask: number

  const gen = sfc32(...seed)

  for (let index = 0; index < pixels.length; index++) {
    pixel = pixels[index]
    bits = pixel[0] << 16 | pixel[1] << 8 | pixel[2]

    mask = gen() * 0xFFFFFF
    bits ^= mask

    pixel[0] = (bits >> 16) & 0xFF
    pixel[1] = (bits >> 8) & 0xFF
    pixel[2] = (bits >> 0) & 0xFF
    image.setPixel(index, pixel)
  }

  return Buffer.from((image as Image).toBuffer({ format: 'png' }))
}
