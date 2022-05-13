import { InteractionCommandType, ReplyableCommandInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import { TudeBot } from '../..'
import BotProfile from '../../lib/users/bot-profile'


export default async function (i: ReplyableCommandInteraction) {
  if (!i.member) {
    return i.replyPrivately({
      title: 'Nope',
      description: 'Run this in a server dude'
    })
  }

  i.defer(i.data.type === InteractionCommandType.USER)

  try {
    const user = (i.data.option.user || (i.data.type === InteractionCommandType.USER && i.data.target.id) || i.user.id) + ''
    const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
    const member = await channel.guild.members.fetch(user)

    if (member.user.bot) {
      const data = await BotProfile.getBotMeta(member)
      i.state('userprofile_bot', member, channel, data)
    } else {
      i.state('userprofile_main', member, channel)
    }
    return true
  } catch (ex) {
    console.error(ex)
    i.reply({
      title: 'Cringe',
      description: 'Something failed lmao'
    })
    return true
  }
}

