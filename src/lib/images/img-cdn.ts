import { Attachment, AttachmentBuilder, TextChannel } from 'discord.js'
import { TudeBot } from '../..'


const channelId = '886200758142369822'

export default async function uploadImageToCdn(buffer: Buffer, fileName = 'image.png'): Promise<string> {
  const channel = await TudeBot.channels.fetch(channelId) as TextChannel
  const file = new AttachmentBuilder(buffer).setName(fileName)
  const mes = await channel.send({ files: [ file ] })
  return mes.attachments.first().proxyURL.replace('https://media.discordapp.net/', 'https://cdn.discordapp.com/')
}
