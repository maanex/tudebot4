import { InteractionApplicationCommandCallbackData, InteractionCommandType, ReplyableCommandInteraction } from 'cordo'
import { GuildMember, TextChannel } from 'discord.js'
import { TudeBot } from '../..'
import Emojis from '../../lib/emojis'
import UserStalker from '../../lib/users/user-stalker'


export default async function (i: ReplyableCommandInteraction) {
  if (!i.member) {
    return i.replyPrivately({
      title: 'Nope',
      description: 'Run this in a server dude'
    })
  }

  i.defer(i.data.type === InteractionCommandType.USER)

  const user = (i.data.option.user || (i.data.type === InteractionCommandType.USER && i.data.target.id) || i.user.id) + ''

  try {
    const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel
    const member = await channel.guild.members.fetch(user)
    const message = await buildMessage(channel, member)
    i.reply(message)
    return true
  } catch (ex) {
    console.error(ex)
    i.reply({
      title: 'Cringe',
      description: 'Something failed lmao'
    })
    return false
  }
}


async function buildMessage(_channel: TextChannel, member: GuildMember): Promise<InteractionApplicationCommandCallbackData> {
  const fields = [ ]
  const icons = {
    '-2': Emojis.status.error,
    '-1': Emojis.status.warning,
    0: Emojis.status.neutral,
    1: Emojis.status.ok,
    undefined: ''
  }
  const toText = (item: [ number, string ]) => `${icons[item[0]]} ${item[1]}`

  const generalJoinDiscord = getGeneralJoinDiscord(member)
  const generalJoinServer = getGeneralJoinServer(member)
  // const generalLastMessage = getGeneralLastMessage(member)
  fields.push({
    name: 'General',
    value: [
      toText(generalJoinDiscord),
      toText(generalJoinServer)
      // toText(generalLastMessage)
    ].join('\n'),
    inline: false
  })

  if (member.user.bot) {
    const botMeta = await getBotMeta(member)
    fields.push({
      name: 'Bot Info',
      value: toText(botMeta)
    })
  } else {
    const thirdpartyDiscordBio = await getThirdpartyDiscordBio(member)
    const thirdpartyGlobalBan = await getThirdpartyGlobalBan(member)
    fields.push({
      name: 'Third Party Services',
      value: [
        toText(thirdpartyDiscordBio),
        toText(thirdpartyGlobalBan)
      ].join('\n'),
      inline: false
    })
  }

  // fields.push({
  //   name: 'Overall Trustworthiness Score:',
  //   value: `**\`\`\`js\n${info.trustworthiness.score}\`\`\`**`,
  //   inline: false
  // })

  return {
    embeds: [
      {
        author: {
          name: `About ${member.user.tag}`,
          // @ts-ignore
          icon_url: member.user.avatarURL()
        },
        color: 0x2F3136,
        fields
      }
    ]
  }
}

function getGeneralJoinDiscord(member: GuildMember): [ number, string ] {
  const delta = Date.now() - member.user.createdAt.getTime()
  return [
    delta < 1000 * 60 * 60 * 24 * 30
      ? -2
      : delta < 1000 * 60 * 60 * 24 * 400
        ? -1
        : 1,
    `Joined Discord <t:${~~(member.user.createdAt.getTime() / 1000)}:D>`
  ]
}

function getGeneralJoinServer(member: GuildMember): [ number, string ] {
  const delta = Date.now() - member.joinedAt.getTime()
  return [
    delta < 1000 * 60 * 60 * 24 * 7
      ? -2
      : delta < 1000 * 60 * 60 * 24 * 30
        ? -1
        : 1,
    `Joined this server <t:${~~(member.joinedAt.getTime() / 1000)}:D>`
  ]
}

// function getGeneralLastMessage(member: GuildMember): [ number, string ] {
//   return [
//     0,
//     member.lastMessage
//       ? `Sent their [last message](${member.lastMessage.url}) <t:${~~(member.lastMessage.createdAt.getTime() / 1000)}:R>`
//       : 'Has not sent any messages in a while, possibly never.'
//   ]
// }

async function getThirdpartyDiscordBio(member: GuildMember): Promise<[ number, string ]> {
  const data = await UserStalker.fetchDiscordBio(member.id)

  return data?.found
    ? [ 1, `[Public bio found.](${data.url}) ${data.datapoints} ${data.datapoints === 1 ? 'datapoint' : 'datapoints'}.` ]
    : [ 0, 'No public bio found.' ]
}

async function getThirdpartyGlobalBan(member: GuildMember): Promise<[ number, string ]> {
  const data = await UserStalker.fetchKsoftSi(member.id)

  return !data
    ? [ 1, 'No records in the global ban list found.' ]
    : data.currentlyBanned
      ? [ -2, `**Currently globally banned for** ${data.reason}!` ]
      : data.previouslyBanned
        ? [ -1, `**Previously globally banned for** ${data.reason}!` ]
        : [ 1, `${member.user.username} is not globally banned.` ]
}

async function getBotMeta(member: GuildMember): Promise<[ number, string ]> {
  const data = await UserStalker.fetchBotMeta(member.id)

  const visibility = data.rpc.bot_public ? 'Public bot' : 'Private bot'
  const codegrant = data.rpc.bot_require_code_grant ? 'Code grant required' : 'No code grant'
  const policiesRaw = [
    data.rpc.privacy_policy_url ? `[Privacy Policy](${data.rpc.privacy_policy_url})` : '',
    data.rpc.terms_of_service_url ? `[Terms Of Service](${data.rpc.terms_of_service_url})` : ''
  ].join(', ')
  const policiesList = policiesRaw ? `Policies: ${policiesRaw}\n` : ''
  const assets = !data.assets?.length
    ? 'No assets found'
    : 'Assets: ' + data.assets.slice(0, 7).map(a => `[${a.name}](https://cdn.discordapp.com/app-assets/${member.id}/${a.id}.webp?size=4096)`).join(', ') + (data.assets.length > 7 ? `, [+${data.assets.length - 7} more](https://discord.com/api/v9/oauth2/applications/${member.id}/assets)` : '')

  return [
    undefined,
    `${visibility}, ${codegrant}\n${policiesList}${assets}`
  ]
}


// function kFormatter(num: number) {
//   return Math.abs(num) > 999 ? Math.sign(num) * (Math.floor(Math.abs(num) / 100) / 10) + 'k' : Math.sign(num) * Math.abs(num)
// }


/*

whois command
[x] shows when someone joined the server
[x] how long they've been here
[x] any records on dscbio
[ ] any records on ksoft
[-] profile info, badges and stuff
[-] show club profile, really short: level, cookies
[ ] amount of messages sent in total (idk?)
[ ] amount of messages in the last week
[ ] any incidents recorded (HERE: MAKE CLEANCHAT AND STUFF ALL ADD RECORDS TO A USER, LIKE INVITE LINK AND STUFF)
MAYBE EVEN MAKE A USER ACCOUNT THAT ACTS LIKE A BOT AND JUST SPIES ON USERS CONNECTIONS
 -> from there on check out their connected accounts
MAYBE (NO) MAKE FREESTUFF BOT CHECK USERS GUILDS
 -> NO. no.

*/

