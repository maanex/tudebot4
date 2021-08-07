import axios from 'axios'
import { ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'


export default async function (i: ReplyableCommandInteraction) {
  const kind = (i.data.option.kind || 'random') + ''
  const url = await findImage(kind, i)

  i.reply({
    embeds: [ {
      color: 0x2F3136,
      image: { url }
    } ]
  })
}

async function findImage(kind: string, i: ReplyableCommandInteraction): Promise<string> {
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
    return o[Math.floor(Math.random() * o.length)]
  }
  if (kind === 'inspiration') {
    const { data: o } = await axios.get('http://inspirobot.me/api?generate=true')
    return o
  }
  if (kind === 'you') {
    const user = await TudeBot.users.fetch(i.user.id)
    return user.avatarURL()
  }
  return ''
}

