import * as Jimp from 'jimp'
import { perlin2, seed } from '../util/perlin'


export default function generateFunnyImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    Jimp.read(url)
      .then((img) => {

        img.resize(400, 400)

        let c = 0
        let xo = 0
        let yo = 0
        const w = img.getWidth()
        const h = img.getHeight()
        const org = img.clone()
        const fac = 1 / w
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
