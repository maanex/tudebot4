import * as Jimp from 'jimp'
import { perlin2, seed } from '../../alg/perlin'


const funnies = [
  'melt',
  'deepfry',
  'invert',
  'rotate',
  'pixelate',
  'sepia',
  'fade'
] as const
type FunnyType = typeof funnies[number] | 'random'

export default function generateFunnyImage(url: string, type: FunnyType = 'random'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    Jimp.read(url)
      .then((img) => {
        img.resize(400, 400)

        if (type === 'random') {
          do img = applyFunny[funnies[~~(Math.random() * funnies.length)]](img)
          while (Math.random() < 0.8)
        } else {
          img = applyFunny[type](img)
        }


        img.getBuffer(Jimp.MIME_PNG, (err, res) => {
          if (err) reject(err)
          else resolve(res)
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const applyFunny: {
  [key in typeof funnies[number]]: (image: Jimp) => Jimp
} = {
  melt(img: Jimp) {
    let c = 0
    let xo = 0
    let yo = 0
    const w = img.getWidth()
    const h = img.getHeight()
    const org = img.clone()
    const facBase = Math.random() * Math.random() * 2 + 1
    const fac = facBase / w
    seed(~~(Math.random() * Number.MAX_SAFE_INTEGER))

    for (let y = 0; y < h; y++) {
      org.setPixelColor(0, 0, y)
      org.setPixelColor(0, w - 1, y)
    }
    for (let x = 1; x < w - 1; x++) {
      org.setPixelColor(0, x, 0)
      org.setPixelColor(0, x, h - 1)
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        xo = ~~(perlin2(x * fac, y * fac) * w / 5)
        yo = ~~(perlin2((x + w * 5) * fac, (y + h * 5) * fac) * w / 5)
        c = org.getPixelColor(x + xo, y + yo)
        img.setPixelColor(c, x, y)
      }
    }

    return img
  },
  deepfry(img: Jimp) {
    return img
      .gaussian(Math.random() * 10 + 1)
      .contrast(1)
      .dither16()
  },
  invert(img: Jimp) {
    return img.invert()
  },
  rotate(img: Jimp) {
    return img.rotate(Math.random() * 360)
  },
  pixelate(img: Jimp) {
    return img.pixelate(Math.random() * 20 + 1)
  },
  sepia(img: Jimp) {
    return img.sepia()
  },
  fade(img: Jimp) {
    return img.fade(Math.random())
  }
}
