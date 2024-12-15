import { AttachmentBuilder, EmbedBuilder, Events, Message, SendableChannels, TextChannel } from 'discord.js'
import { config, TudeBot } from '../index'
import { Module } from '../types/types'
import generateInviteLinkMeme from '../lib/images/generators/generate-invite-link-meme'


export default class ChatGuard extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('ChatGuard Automod', '🔱', 'Keeps your server clean', 'ChatGuard is TudeBot\'s auto moderator. It will protect you from some basic spam. It is not the most powerful tool out there as of right now.', 'public', conf, data, guilds)
  }

  public onEnable() {
    TudeBot.on(Events.MessageCreate, (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return
      if (mes.member.permissions.has('ManageMessages')) return //
      if (mes.member.roles.highest.comparePositionTo(mes.guild.members.me.roles.highest) > 0) return // TODO REENABLE, DISABLED FOR EASIER TESTING

      if (this.checkInviteLinks(mes)) return
      if (!mes.channel.isSendable()) return

      if (config.thirdparty.googleapis.key) {
        TudeBot.perspectiveApi.analyze(mes.content).then((res) => {
          // TudeBot.perspectiveApi.logFull(res, true);

          const oneOf = (list: string[]) => list[Math.floor(Math.random() * list.length)]
          if (res.threat > 0.95) {
            (mes.channel as SendableChannels).send(oneOf([ 'That was too much %!', 'Stop this right now %!', 'You better shut your mouth %', 'Shut up %', 'You took it too far %!' ]).split('%').join(mes.author.toString()))
            mes.delete()
            return
          }
          if (res.severeToxicity > 0.98) {
            (mes.channel as SendableChannels).send(oneOf([ 'Pretty rude %!', 'That was too much %!', 'Calm the fuck down %!', 'Shut up %', 'Watch your mouth %' ]).split('%').join(mes.author.toString()))
            mes.delete()
            return
          }
          if (res.insult > 0.95) {
            (mes.channel as SendableChannels).send(oneOf([ 'Damn %', 'Oh wow %', 'I\'ll have to remove that %', 'Pretty rude %', 'That was pretty rude %!', 'Oh come on, don\'t be like that %!' ]).split('%').join(mes.author.toString()))
            mes.delete()
            return
          }
          if (res.toxicity > 0.95) {
            (mes.channel as SendableChannels).send(oneOf([ '% dude. Chill!', '% chill!', 'Yo % calm down', 'No reason to rage out %!', 'Chill %', 'Calm down %' ]).split('%').join(mes.author.toString()))
            return
          }
          if (res.sexuallyExplicit > 0.95) {
            (mes.channel as SendableChannels).send(oneOf([ 'Please keep things kid friendly %', 'No nsfw here %', 'A bit more kids friendly please %', 'That ain\'t sfw %', 'Watch your mouth %' ]).split('%').join(mes.author.toString()))
            return
          }
          if (res.flirtation > 0.95)
            mes.react(oneOf([ '😉', '😏' ]))
        })
      }
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  public repl(message: Message, title: string, description: string) {
    (message.channel as TextChannel).send({
      embeds: [
        {
          color: 0x2F3136,
          title,
          description,
          footer: { text: 'ChatGuard • Auto Moderator' }
        }
      ]
    })
  }

  /* */

  private inviteResponseStatus = 0;

  public checkInviteLinks(mes: Message): boolean {
    if (!/discord.gg\/.+/i.test(mes.content) && !/discordapp.com\/invite\/.+/i.test(mes.content)) return false

    if (this.inviteResponseStatus === 0) {
      generateInviteLinkMeme(mes.author.username)
        .then((img) => {
          const file = new AttachmentBuilder(img).setName(`shut-up-${mes.author.username.toLowerCase()}.png`)
          const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setImage(`attachment://shut-up-${mes.author.username.toLowerCase()}.png`)

          ;(mes.channel as SendableChannels).send({
            embeds: [ embed ],
            files: [ file ]
          })
        })
        .catch((err) => {
          console.error(err)
          this.repl(mes, 'No invite links!', 'Please do not advertise here, thanks!')
        })
    } else if (this.inviteResponseStatus === 1) {
      this.repl(mes, 'I was not kidding!', 'No advertising here. And no Discord invite links!')
    } else if (this.inviteResponseStatus === 5) {
      this.repl(mes, 'See, I tried to stay calm but enough is enough!', 'Now would you please shut the fuck up and stop posting invite links?')
    }

    this.inviteResponseStatus++
    setTimeout(i => i.inviteResponseStatus--, 5 * 60 * 1000, this)

    TudeBot.modlog(mes.guild, 'cleanChat', `${mes.author} sent an invite link.`)

    mes.delete()
    return true
  }

}
