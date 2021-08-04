import { Message, User, TextChannel, GuildMember } from 'discord.js'
import * as moment from 'moment'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import Emojis from '../int/emojis'
import UserStalker, { UserInfo } from '../modules/thebrain/user-stalker'


export default class WastedCommand extends Command {

  constructor() {
    super({
      name: 'whois',
      description: 'Who is that?',
      groups: [ 'info' ],
      cooldown: 10
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (event.message.mentions.members.size)
      user = event.message.mentions.members.first().user
    if (user.bot) {
      repl('[Click here for more info](https://www.youtube.com/watch?v=cvh0nX08nRw)')
      return true
    }

    try {
      const member = await channel.guild.members.fetch(user)
      const out = sendMessage(channel, user, member)
      const details = UserStalker.getInfo(user)
      sendMessage(channel, user, member, await details, await out)
      return true
    } catch (ex) {
      console.error(ex)
      repl('An error occured!', 'bad')
      return false
    }
  }

}

function sendMessage(channel: TextChannel, user: User, member: GuildMember, detailedInfo?: UserInfo, override?: Message): Promise<Message> {
  const payload = {
    embed: {
      author: {
        name: `About ${user.tag}`
      },
      fields: [
        {
          name: 'General',
          value: `Joined Discord ${moment(user.createdAt).fromNow()} (${moment(user.createdAt).calendar()})
                Joined this server ${moment(member.joinedAt).fromNow()} (${moment(member.joinedAt).calendar()})
                ${member.lastMessage ? `Sent their last message ${moment(member.lastMessage.createdAt).fromNow()}` : 'Has not sent any messages in a while, possibly never.'}`
        }
      ],
      color: 0x2F3136
    }
  }

  if (detailedInfo) {
    const trust = detailedInfo.trustworthiness
    const sources = trust.sources
    payload.embed.fields.push({
      name: 'Third Party Services',
      value: `${(sources.discordbio && sources.discordbio.found)
                ? `[Public bio found.](${sources.discordbio.url}) ${sources.discordbio.datapoints} ${sources.discordbio.datapoints === 1 ? 'datapoint' : 'datapoints'}.`
                : 'No public bio found.'}
              ${sources.ksoftsi
                ? (sources.ksoftsi.currentlyBanned
                  ? `:warn: **Currently globally banned for** ${sources.ksoftsi.reason}!`
                  : (sources.ksoftsi.previouslyBanned
                    ? `:warn: **Previously globally banned for** ${sources.ksoftsi.reason}!`
                    : `${user.username} is not globally banned.`))
                : 'No records in the global ban list found.'}`
    })
    payload.embed.fields.push({
      name: 'Overall Trustworthiness Score:',
      value: `**\`\`\`js\n${trust.score}\`\`\`**`
    })
  } else {
    payload.embed.fields.push({
      name: Emojis.BIG_SPACE,
      value: `${Emojis.LOADING} Loading...`
    })
  }

  if (override) return override.edit(payload)
  else return channel.send(payload) as Promise<Message>
}


// function kFormatter(num: number) {
//   return Math.abs(num) > 999 ? Math.sign(num) * (Math.floor(Math.abs(num) / 100) / 10) + 'k' : Math.sign(num) * Math.abs(num)
// }


/*

whois command
shows when someone joined the server
how long they've been here
any records on ksoft
any records on dscbio
profile info, badges and stuff
show club profile, really short: level, cookies
amount of messages sent in total (idk?)
amount of messages in the last week
any incidents recorded (HERE: MAKE CLEANCHAT AND STUFF ALL ADD RECORDS TO A USER, LIKE INVITE LINK AND STUFF)
MAYBE EVEN MAKE A USER ACCOUNT THAT ACTS LIKE A BOT AND JUST SPIES ON USERS CONNECTIONS
 -> from there on check out their connected accounts
MAYBE (NO) MAKE FREESTUFF BOT CHECK USERS GUILDS
 -> NO. no.

*/
