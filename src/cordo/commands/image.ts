import axios from 'axios'
import { ReplyableCommandInteraction } from 'cordo'
import Image from 'image-js'
import { TudeBot } from '../..'
import generateFunnyImage from '../../lib/images/generators/generate-funny-image'
import { oneInOne } from '../../lib/images/enc/one-in-one'
import uploadImageToCdn from '../../lib/images/img-cdn'
import { generateTellmeImage } from '../../lib/images/generators/generate-tellme-image'


export default async function (i: ReplyableCommandInteraction) {
  const kind = (i.data.option.kind || 'random') + ''
  i.defer()

  const url = await findImage(kind, i)
  if (url) i.reply({ content: url })
  else i.reply({ content: 'No image found! *Oh no*' })
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
    const { data: o } = await axios.get('https://raw.githubusercontent.com/tude-webhost/publicdata/master/imgdb.json')
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
  if (kind === 'tellme') {
    const { data: urls } = await axios.get('https://raw.githubusercontent.com/tude-webhost/publicdata/master/imgdb.json')

    let attempts = 5
    let source: string
    let buffer: Buffer
    do {
      try {
        source = urls[~~(Math.random() * urls.length)]
        buffer = await generateTellmeImage(source)
        return uploadImageToCdn(buffer)
      } catch (ex) { }
    } while (attempts-- >= 0)

    return ''
  }
  return ''
}

