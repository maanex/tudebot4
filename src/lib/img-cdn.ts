import { MessageAttachment, TextChannel } from 'discord.js'
import { TudeBot } from '..'


const channelId = '886200758142369822'

export default async function uploadImageToCdn(buffer: Buffer, fileName = 'image.png'): Promise<string> {
  const channel = await TudeBot.channels.fetch(channelId) as TextChannel
  const file = new MessageAttachment(buffer, fileName)
  const mes = await channel.send({ files: [ file ] })
  return mes.attachments.first().proxyURL
}
