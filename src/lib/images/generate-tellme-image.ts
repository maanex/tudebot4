/* eslint-disable no-new */
import * as Jimp from 'jimp'


export function generateTellmeImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const outsize = 256
    Jimp.read(url)
      .then((input) => {
        new Jimp(256, 256, 0x000000, (err, white) => {
          if (err) throw err

          if (Jimp.distance(input, white) < 0.3) input.invert()

          new Jimp(outsize, outsize, (err, out) => {
            if (err) throw err

            for (let x = 1; x < outsize; x++) {
              for (let y = 1; y < outsize; y++) {
                const orgX = input.getWidth() / outsize * x
                const orgY = input.getHeight() / outsize * y
                let color = removeLast8Bit(input.getPixelColor(orgX, orgY))
                const orgY2 = input.getHeight() / outsize * (y - 1)
                const color2 = removeLast8Bit(input.getPixelColor(orgX, orgY2))
                const orgX3 = input.getWidth() / outsize * (x - 1)
                const color3 = removeLast8Bit(input.getPixelColor(orgX3, orgY))

                let contrast = ~~((getContrast(color, color2) * getContrast(color, color3)) / 2)

                color = removeLast8Bit(input.getPixelColor(orgX, orgY - (input.getHeight() / outsize * Math.min(y, contrast / 10))))

                const vignette = 1 - Math.sqrt((outsize / 2 - x) ** 2 + (outsize / 2 - y) ** 2) / Math.sqrt(2 * ((outsize / 2) ** 2))
                // contrast *= colorRamp(vignette);
                // if (contrast > 230) contrast = 230;
                // if (contrast < 15) contrast = 15;
                contrast = vignette * 255

                const hexR = (~~(colorRamp(((color >> 16) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                const hexG = (~~(colorRamp(((color >> 8) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                const hexB = (~~(colorRamp(((color >> 0) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                out.setPixelColor(parseInt(hexG + hexB + hexR + 'ff', 16), x, y)
              }
            }

            // if (Math.random() < .5) out.invert();
            out.sepia()
            out.posterize(10)

            for (let x = 1; x < outsize; x++) {
              for (let y = 1; y < outsize; y++) {
                const color = removeLast8Bit(out.getPixelColor(x, y))
                const r = Math.min(((color >> 16) & 0b11111111) + 54, 255)
                const g = Math.min(((color >> 8) & 0b11111111) + 57, 255)
                const b = Math.min(((color >> 0) & 0b11111111) + 63, 255)
                out.setPixelColor(parseInt(r.toString(16) + g.toString(16) + b.toString(16) + 'ff', 16), x, y)
              }
            }

            // out.write('./tmp/out.png');
            out.getBuffer(Jimp.MIME_PNG, (err, res) => {
              if (err) reject(err)
              else resolve(res)
            })
          })
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function colorRamp(input: number): number {
  let t = input
  const b = 0
  const c = 255
  const d = 255
  if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b
  return -c / 2 * ((t -= 2) * t * t * t - 2) + b
}

function removeLast8Bit(number: number): number {
  return parseInt(number.toString(16).padStart(8, '0').substr(0, 6), 16)
}

function getContrast(color1: number, color2: number): number {
  const c1r = (color1 >> 16) & 0b11111111
  const c1g = (color1 >> 8) & 0b11111111
  const c1b = (color1 >> 0) & 0b11111111
  const c2r = (color2 >> 16) & 0b11111111
  const c2g = (color2 >> 8) & 0b11111111
  const c2b = (color2 >> 0) & 0b11111111

  const c1cont = (299 * c1r + 587 * c1g + 114 * c1b) / 1000
  const c2cont = (299 * c2r + 587 * c2g + 114 * c2b) / 1000

  return Math.abs(c1cont - c2cont)
}
