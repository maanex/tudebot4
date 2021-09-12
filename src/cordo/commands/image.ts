import axios from 'axios'
import { ReplyableCommandInteraction } from 'cordo'
import Image from 'image-js'
import { TudeBot } from '../..'
import generateFunnyImage from '../../functions/generate-funny-image'
import { oneInOne } from '../../lib/enc/one-in-one'
import uploadImageToCdn from '../../lib/img-cdn'


export default async function (i: ReplyableCommandInteraction) {
  const kind = (i.data.option.kind || 'random') + ''
  i.defer()

  const url = await findImage(kind, i)
  i.reply({ content: url })
}

export async function findImage(kind: string, i: ReplyableCommandInteraction): Promise<string> {
  if (kind === 'dog') {
    const { data: o } = await axios.get('https://api.thedogapi.com/v1/images/search?format=json')
    return o[0].url
  }
  if (kind === 'cat') {
    const { data: o } = await axios.get('https://api.thecatapi.com/v1/images/search?format=json')
    return o[0].url
  }
  if (kind === 'random') {
    const { data: o } = await axios.get('http://pd.tude.ga/imgdb.json')
    const url1 = o[Math.floor(Math.random() * o.length)]
    if (Math.random() < 0.8) return url1

    try {
      const url2 = o[Math.floor(Math.random() * o.length)]

      const { data: as } = await axios.get(url1, { responseType: 'arraybuffer' })
      const { data: disguise } = await axios.get(url2, { responseType: 'arraybuffer' })
      const buff = oneInOne(await Image.load(disguise), await Image.load(as), '12')
      const out = uploadImageToCdn(buff)

      return out
    } catch (ex) {
      return url1
    }
  }
  if (kind === 'inspiration') {
    const { data: o } = await axios.get('http://inspirobot.me/api?generate=true')
    return o
  }
  if (kind === 'you') {
    const user = await TudeBot.users.fetch(i.user.id)
    const avatar = user.avatarURL({ format: 'png' })
    if (Math.random() < 0.05)
      return avatar

    const buffer = await generateFunnyImage(avatar)
    const url = await uploadImageToCdn(buffer)
    return url
  }
  return ''
}

