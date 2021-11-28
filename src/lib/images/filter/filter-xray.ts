import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'


export default function (input: Image): Promise<Buffer> {
  const image = new Image(input.width, input.height)
  const pixels = getPixelsArray(input)

  let ratio, r, g, b
  for (let i = 0; i < pixels.length; i++) {
    ratio = pixels[i][0]
    ratio += ~~(Math.random() * 30) - 15

    if (ratio < 0) ratio = 0
    else if (ratio > 255) ratio = 255

    ratio = easeInOutCubic(ratio / 255)

    if (ratio > 0.9) {
      r = blend(0xEE, 0xEE, (ratio - 0.9) * 10)
      g = blend(0x99, 0xAA, (ratio - 0.9) * 10)
      b = blend(0xBB, 0xCC, (ratio - 0.9) * 10)
    } else {
      r = blend(0xEE, 0x00, ratio / 9 * 10)
      g = blend(0xAA, 0x00, ratio / 9 * 10)
      b = blend(0xCC, 0x22, ratio / 9 * 10)
    }

    r += ~~(Math.random() * 10) - 5
    g += ~~(Math.random() * 10) - 5
    b += ~~(Math.random() * 10) - 5

    if (ratio > 0.98) {
      r = 255
      g = 255
      b = 255
    } else {
      if (r < 0) r = 0
      else if (r > 255) r = 255
      if (g < 0) g = 0
      else if (g > 255) g = 255
      if (b < 0) b = 0
      else if (b > 255) b = 255
    }

    image.setPixel(i, [ r, g, b ])
  }

  return Promise.resolve(Buffer.from(image.toBuffer({ format: 'png' })))
}

//

function blend(value1, value2, ratio) {
  return ~~((value1 * ratio) + (value2 * (1 - ratio)))
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
