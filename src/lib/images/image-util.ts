import { Image } from 'image-js'


/** https://github.com/image-js/image-js/blob/93d3cce18279cf1efe82a0e39f288d2276036959/src/image/transform/colorDepth.js#L15-L61 */
export function changeColorDepth(image: Image, depth: 8 | 16): Image {
  if (image.bitDepth === depth)
    return image.clone()

  const newImage = Image.createFrom(image, { bitDepth: depth })

  switch (depth) {
    case 8:
      if (image.bitDepth === 1) {
        for (let i = 0; i < image.size; i++) {
          if (image.getBit(i))
            newImage.data[i] = 255
        }
      } else {
        for (let i = 0; i < image.data.length; i++)
          newImage.data[i] = image.data[i] >> 8
      }
      break
    case 16:
      if (image.bitDepth === 1) {
        for (let i = 0; i < image.size; i++) {
          if (image.getBit(i))
            newImage.data[i] = 65535
        }
      } else {
        for (let i = 0; i < image.data.length; i++)
          newImage.data[i] = (image.data[i] << 8) | image.data[i]
      }
      break
  }
  return newImage
}


/** https://github.com/image-js/image-js/blob/93d3cce18279cf1efe82a0e39f288d2276036959/src/image/utility/getPixelsArray.js#L8-L24 */
export function getPixelsArray(image: Image): number[][] {
  const array = new Array(image.size)
  let ptr = 0
  for (let i = 0; i < image.data.length; i += image.channels) {
    const pixel = new Array(image.components)
    for (let j = 0; j < image.components; j++)
      pixel[j] = image.data[i + j]
    array[ptr++] = pixel
  }
  return array
}
