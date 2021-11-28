import axios from 'axios'
import { InteractionCommandType, ReplyableCommandInteraction } from 'cordo'


export default async function (i: ReplyableCommandInteraction) {
  if (i.data.type !== InteractionCommandType.MESSAGE) return i.defer()

  const json = JSON.stringify(i.data.target, null, 2)
  if (json.length < 1980) {
    i.replyPrivately({
      content: `\`\`\`json\n${json}\`\`\``
    })
    return
  }

  i.defer(true)

  const { data, status } = await axios.post('https://www.toptal.com/developers/hastebin/documents', json)
  if (status === 200) {
    i.replyPrivately({
      content: `https://www.toptal.com/developers/hastebin/raw/${data.key}`
    })
    return
  }

  const jsonSmol = JSON.stringify(i.data.target, null)
  if (jsonSmol.length < 1980) {
    i.replyPrivately({
      content: `\`\`\`json\n${jsonSmol}\`\`\``
    })
    return
  }

  console.log(json)
  i.replyPrivately({
    content: 'Source is too big to send through Discord and Hastebin upload failed. Message source has been printed to console.'
  })
}

