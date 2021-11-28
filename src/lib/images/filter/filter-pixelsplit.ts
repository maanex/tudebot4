import { Image } from 'image-js'
import { getPixelsArray } from '../image-util'


export default function (input: Image): Promise<Buffer> {
  const image = new Image(input.width, input.height)
  const pixels = getPixelsArray(input)
  const size = 4
  const min = size / 2
  const w = image.width
  const h = image.height

  let temp
  let r
  let g
  let b
  let x
  let y

  for (let i = 0; i < pixels.length; i++) {
    x = i % w
    y = ~~(i / w)

    r = 0
    g = 0
    b = 0

    if (x % size < min) {
      if (y % size < min)
        r = getPixel(pixels, x, y, w, h, size)[0]
      else
        b = getPixel(pixels, x, y, w, h, size)[2]

    } else if (y % size < min) {
      temp = (getPixel(pixels, x, y, w, h, size)[0] + getPixel(pixels, x, y, w, h, size)[1] + getPixel(pixels, x, y, w, h, size)[2]) / 3
      r = temp
      g = temp
      b = temp
    } else {
      g = getPixel(pixels, x, y, w, h, size)[1]
    }

    image.setPixel(i, [ r, g, b ])
  }

  return Promise.resolve(Buffer.from(image.toBuffer({ format: 'png' })))
}

//

function getPixel(pixels, x, y, w, h, size) {
  x = ~~(x / size) * size
  y = ~~(y / size) * size
  if (x < 0) return [ 0, 0, 0, 0 ]
  if (y < 0) return [ 0, 0, 0, 0 ]
  if (x >= w) return [ 0, 0, 0, 0 ]
  if (y >= h) return [ 0, 0, 0, 0 ]
  return pixels[y * w + x]
}
