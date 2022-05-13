import { ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import { TudeBot } from '../../..'


export default async function (i: ReplyableComponentInteraction) {
  if (!i.member) {
    return i.replyPrivately({
      title: 'Nope',
      description: 'Run this in a server dude'
    })
  }

  try {
    const user = i.params.userid
    const page = i.params.page
    const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
    const member = await channel.guild.members.fetch(user)

    if (member.user.bot) return i.ack()

    i.state(`userprofile_${page}`, member, channel)
  } catch (ex) {
    console.error(ex)
    i.reply({
      title: 'Cringe',
      description: 'Something failed lmao'
    })
  }
}
