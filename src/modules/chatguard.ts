import { Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'
import generateInviteLinkMeme from '../functions/generate-invite-link-meme'
import LinkAnalyzer from './thebrain/link-analyzer'


export default class ChatGuard extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('ChatGuard Automod', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return
      if (mes.member.hasPermission('MANAGE_MESSAGES')) return //
      if (mes.member.roles.highest.comparePositionTo(mes.guild.me.roles.highest) > 0) return // TODO REENABLE, DISABLED FOR EASIER TESTING

      if (this.checkInviteLinks(mes)) return


      TudeBot.perspectiveApi.analyze(mes.content).then((res) => {
        // TudeBot.perspectiveApi.logFull(res, true);

        const oneOf = (list: string[]) => list[Math.floor(Math.random() * list.length)]
        if (res.threat > 0.95) {
          mes.channel.send(oneOf([ 'That was too much %!', 'Stop this right now %!', 'You better shut your mouth %', 'Shut up %', 'You took it too far %!' ]).split('%').join(mes.author.toString()))
          mes.delete()
          return
        }
        if (res.severeToxicity > 0.98) {
          mes.channel.send(oneOf([ 'Pretty rude %!', 'That was too much %!', 'Calm the fuck down %!', 'Shut up %', 'Watch your mouth %' ]).split('%').join(mes.author.toString()))
          mes.delete()
          return
        }
        if (res.insult > 0.95) {
          mes.channel.send(oneOf([ 'Damn %', 'Oh wow %', 'I\'ll have to remove that %', 'Pretty rude %', 'That was pretty rude %!', 'Oh come on, don\'t be like that %!' ]).split('%').join(mes.author.toString()))
          mes.delete()
          return
        }
        if (res.toxicity > 0.95) {
          mes.channel.send(oneOf([ '% dude. Chill!', '% chill!', 'Yo % calm down', 'No reason to rage out %!', 'Chill %', 'Calm down %' ]).split('%').join(mes.author.toString()))
          return
        }
        if (res.sexuallyExplicit > 0.95) {
          mes.channel.send(oneOf([ 'Please keep things kid friendly %', 'No nsfw here %', 'A bit more kids friendly please %', 'That ain\'t sfw %', 'Watch your mouth %' ]).split('%').join(mes.author.toString()))
          return
        }
        if (res.flirtation > 0.95)
          mes.react(oneOf([ '😉', '😏' ]))

      })

      LinkAnalyzer.rawMessage(mes)
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  public repl(message: Message, title: string, description: string) {
    (message.channel as TextChannel).send({
      embed: {
        color: 0x2F3136,
        title,
        description,
        footer: { text: 'ChatGuard • Auto Moderator' }
      }
    })
  }

  /* */

  private inviteResponseStatus = 0;

  public checkInviteLinks(mes: Message): boolean {
    if (!/discord.gg\/.+/i.test(mes.content) && !/discordapp.com\/invite\/.+/i.test(mes.content)) return false

    if (this.inviteResponseStatus === 0) {
      generateInviteLinkMeme(mes.author.username)
        .then((img) => {
          const file = new MessageAttachment(img, `shut-up-${mes.author.username.toLowerCase()}.png`)
          const embed = new MessageEmbed()
            .attachFiles([ file ])
            .setColor(0x2F3136)
            .setImage(`attachment://shut-up-${mes.author.username.toLowerCase()}.png`)
          mes.channel.send(embed)
        })
        .catch((err) => {
          console.error(err)
          this.repl(mes, 'No invite links!', 'Please do not advertise here, thanks!')
        })
    } else if (this.inviteResponseStatus === 1) {
      this.repl(mes, 'I was not kidding!', 'No advertising here. And no Discord invite links!')
    } else if (this.inviteResponseStatus === 5) {
      this.repl(mes, 'See, I tried to stay calm but enough is enough!', 'Now would you please shut the fu*** up and stop posting invite links?')
    }

    this.inviteResponseStatus++
    setTimeout(i => i.inviteResponoseStatus--, 5 * 60 * 1000, this)

    TudeBot.modlog(mes.guild, 'clean_chat', `${mes.author} sent an invite link.`)

    mes.delete()
    return true
  }

}
