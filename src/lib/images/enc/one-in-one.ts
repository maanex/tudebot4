import { Image } from 'image-js'
import { changeColorDepth, getPixelsArray } from '../image-util'
import { grabbit, makeMap, rand } from './enc-util'


export function oneInOne(disguise: Image, as: Image, password: string): Buffer {
  disguise = changeColorDepth(disguise, 8)
  as = changeColorDepth(as, 8)

  if (as.width < disguise.width)
    as = as.resize({ width: disguise.width, preserveAspectRatio: true })
  if (as.height < disguise.height)
    as = as.resize({ height: disguise.height, preserveAspectRatio: true })

  if (disguise.width < as.width)
    as = as.crop({ width: disguise.width, x: (as.width - disguise.width) / 2 })
  if (disguise.height < as.height)
    as = as.crop({ height: disguise.height, y: (as.height - disguise.height) / 2 })

  const out = changeColorDepth(disguise, 16)

  const pixels = getPixelsArray(as)
  const map = makeMap(password, 24)

  let index = 0
  for (const pixel of pixels) {
    const flippo = rand(password, 0xFFFFFF, index * 1.5)
    const dispix = disguise.getPixel(index)
    const dispixOne = dispix[0] << 16 | dispix[1] << 8 | dispix[2]
    const outOne = grabbit(dispixOne ^ flippo, map)

    pixel[0] = (pixel[0] << 8) | ((outOne >> 16) & 0xFF)
    pixel[1] = (pixel[1] << 8) | ((outOne >> 8) & 0xFF)
    pixel[2] = (pixel[2] << 8) | ((outOne >> 0) & 0xFF)
    out.setPixel(index, pixel)
    index++
  }

  return Buffer.from((out as Image).toBuffer({ format: 'png' }))
}
