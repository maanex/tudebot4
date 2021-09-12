import Image from 'image-js'


export function makeMap(seed: string, length: number): number[] {
  if (length % 2 !== 0) return []
  const map = []
  for (let i = 0; i < length; i++)
    map.push(i)
  const out = []
  let iteration = 0
  while (map.length) {
    const a = map.splice(Math.floor(rand(seed, map.length, iteration += 0.251)), 1)[0]
    const b = map.splice(Math.floor(rand(seed, map.length, iteration += 0.251)), 1)[0]
    out[a] = b
    out[b] = a
  }
  return out
}

export function rand(seed: string, max: number, intOffset = 0) {
  const seedint = seed.split('').map((s, i) => s.charCodeAt(0) * i * i / 3).reduce((a, b) => a + b, 0)
  return ~~((Math.sin(seedint + intOffset) / 2 + 0.5) * max)
}

export function grabbit(input: number, map: number[]) {
  let out = 0
  for (const i of map) {
    out = out | (input & 1) << i
    input = input >> 1
  }
  return out
}


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
