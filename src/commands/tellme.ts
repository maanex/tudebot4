/* eslint-disable no-new */
/* eslint-disable no-async-promise-executor */
import { User, TextChannel, MessageAttachment, MessageEmbed } from 'discord.js'
import * as Jimp from 'jimp'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import Emojis from '../int/emojis'


export default class TellmeCommand extends Command {

  constructor() {
    super({
      name: 'tellme',
      aliases: [],
      description: 'Tell me my future',
      groups: [ 'fun', 'rng' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], _event: CommandExecEvent, _repl: ReplyFunction): Promise<boolean> {
    try {
      let num = parseInt(user.id)
      num /= (10 ** `${num}`.length)

      const imgBuffer = await TellmeCommand.run(await TellmeCommand.getUrl(num))
      const file = new MessageAttachment(imgBuffer, user.username.toLowerCase() + '.png')
      const embed = new MessageEmbed()
        .attachFiles([ file ])
        .setColor(0x2F3136)
        .setImage(`attachment://${user.username.toLowerCase()}.png`)
      channel.send('', { embed })
      return true
    } catch (ex) {
      channel.send({
        embed: {
          color: 0x2F3136,
          description: `${Emojis.BIG_SPACE}\n\n${Emojis.BIG_SPACE} ${Emojis.BIG_SPACE} ${Emojis.BIG_SPACE} - ${Emojis.BIG_SPACE} ${Emojis.BIG_SPACE} ${Emojis.BIG_SPACE}\n\n${Emojis.BIG_SPACE}`
        }
      })
      return false
    }
  }

  public static run(url: string): Promise<Buffer> {
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
                  let color = this.removeLast8Bit(input.getPixelColor(orgX, orgY))
                  const orgY2 = input.getHeight() / outsize * (y - 1)
                  const color2 = this.removeLast8Bit(input.getPixelColor(orgX, orgY2))
                  const orgX3 = input.getWidth() / outsize * (x - 1)
                  const color3 = this.removeLast8Bit(input.getPixelColor(orgX3, orgY))

                  let contrast = ~~((this.getContrast(color, color2) * this.getContrast(color, color3)) / 2)

                  color = this.removeLast8Bit(input.getPixelColor(orgX, orgY - (input.getHeight() / outsize * Math.min(y, contrast / 10))))

                  const vignette = 1 - Math.sqrt((outsize / 2 - x) ** 2 + (outsize / 2 - y) ** 2) / Math.sqrt(2 * ((outsize / 2) ** 2))
                  // contrast *= this.colorRamp(vignette);
                  // if (contrast > 230) contrast = 230;
                  // if (contrast < 15) contrast = 15;
                  contrast = vignette * 255

                  const hexR = (~~(this.colorRamp(((color >> 16) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                  const hexG = (~~(this.colorRamp(((color >> 8) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                  const hexB = (~~(this.colorRamp(((color >> 0) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0')
                  out.setPixelColor(parseInt(hexG + hexB + hexR + 'ff', 16), x, y)
                }
              }

              // if (Math.random() < .5) out.invert();
              out.sepia()
              out.posterize(10)

              for (let x = 1; x < outsize; x++) {
                for (let y = 1; y < outsize; y++) {
                  const color = this.removeLast8Bit(out.getPixelColor(x, y))
                  const g = Math.min(((color >> 8) & 0b11111111) + 48, 255)
                  const r = Math.min(((color >> 16) & 0b11111111) + 46, 255)
                  const b = Math.min(((color >> 0) & 0b11111111) + 53, 255)
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

  private static colorRamp(input: number): number {
    let t = input
    const b = 0
    const c = 255
    const d = 255
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b
  }

  private static removeLast8Bit(number: number): number {
    return parseInt(number.toString(16).padStart(8, '0').substr(0, 6), 16)
  }

  private static async getUrl(num: number): Promise<string> {
    const res = await fetch('http://pd.tude.ga/imgdb.json')
    if (!res) return ''
    const o = await res.json()
    if (!o) return ''
    return o[Math.floor(num * o.length)]
  }

  private static getContrast(color1: number, color2: number): number {
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

}
