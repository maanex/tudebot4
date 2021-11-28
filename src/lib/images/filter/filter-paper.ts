import Image from 'image-js'
import { getPixelsArray } from '../image-util'


export default function (input: Image): Promise<Buffer> {
  const image = new Image(input.width, input.height)
  const pixels = getPixelsArray(input)

  let ratio
  let noise
  let ratioNoise
  let r
  let g
  let b

  for (let i = 0; i < pixels.length; i++) {
    ratio = pixels[i][0]
    ratioNoise = ratio < 100 ? (100 - ratio) * 0.2 : 0
    ratio += ~~(Math.random() * ratioNoise * 2) - ratioNoise

    if (ratio < 0) ratio = 0
    else if (ratio > 255) ratio = 255

    ratio /= 255

    if (ratio > 0.9) {
      r = blend(0xEE, 0xE4, (ratio - 0.9) * 10)
      g = blend(0xEE, 0xB3, (ratio - 0.9) * 10)
      b = blend(0xF0, 0xA1, (ratio - 0.9) * 10)
      noise = false
    } else if (ratio < 0.2) {
      r = 0x4B
      g = 0x0D
      b = 0x03
      noise = false
    } else {
      r = blend(0xE4, 0x92, (ratio - 0.2) / 7 * 10)
      g = blend(0xB3, 0x49, (ratio - 0.2) / 7 * 10)
      b = blend(0xA1, 0x31, (ratio - 0.2) / 7 * 10)
      noise = true
    }

    if (noise) {
      r += ~~(Math.random() * 30) - 15
      g += ~~(Math.random() * 30) - 15
      b += ~~(Math.random() * 30) - 15
    }

    if (r < 0) r = 0
    else if (r > 255) r = 255
    if (g < 0) g = 0
    else if (g > 255) g = 255
    if (b < 0) b = 0
    else if (b > 255) b = 255

    image.setPixel(i, [ r, g, b ])
  }

  return Promise.resolve(Buffer.from(image.toBuffer({ format: 'png' })))
}

//

function blend(value1, value2, ratio) {
  return ~~((value1 * ratio) + (value2 * (1 - ratio)))
}
