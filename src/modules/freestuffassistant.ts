import { Message, TextChannel, Webhook } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class FreestuffAssistantModule extends Module {

  private readonly gameMessages: Map<number, Message> = new Map();

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Freestuff Assistant', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('message', async (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return
      if (!mes.content.toLocaleLowerCase().startsWith('fsb')) return

      const reply = this.findReply(mes.content.substr(4)?.toLowerCase()?.split('  ').join(' '))
      if (!reply) return
      const webhook = await this.allocateWebhook(mes.channel as TextChannel)
      if (mes.deletable) mes.delete()

      webhook.send(reply, {
        avatarURL: mes.author.avatarURL(),
        username: mes.member.nickname || mes.author.username
      })
    })
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  public on(event: string, data: any) {
    this.guilds.forEach(async (settings, guildid) => {
      if (!settings) return

      if (!TudeBot || !TudeBot.readyAt) return
      const guild = await TudeBot.guilds.fetch(guildid)

      const contentChannel = guild.channels.resolve(settings.channel_content) as TextChannel
      const servicesChannel = guild.channels.resolve(settings.channel_services) as TextChannel
      if (!contentChannel || !servicesChannel) return

      // const contentMods = settings.contentMods as string[]
      const user = data.user ? await TudeBot.users.fetch(data.user) : null

      let mes: Message = null
      switch (event) {
        case 'game_found':
          mes = await contentChannel.send({
            embed: {
              color: 0xAB6B31,
              title: 'Free Game Found!',
              description: `${data.game.info.title} (${data.game.info.store})\n[Outgoing announcement needs approval, please click here](${`https://dashboard.freestuffbot.xyz/content/${data.game._id}`})`
            }
          }) as Message
          this.gameMessages.set(data.game._id, mes)
          break

        case 'new_scratch':
          mes = await contentChannel.send({
            embed: {
              color: 0x3190AB,
              title: `${user?.username ?? '*Someone*'} created a new announcement`,
              description: `No data provided yet\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
            }
          }) as Message
          this.gameMessages.set(data.game, mes)
          break

        case 'new_url':
          mes = await contentChannel.send({
            embed: {
              color: 0x3190AB,
              title: `${user?.username ?? '*Someone*'} created a new announcement`,
              description: `Automatically fetched data from ${data.url}\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
            }
          }) as Message
          this.gameMessages.set(data.game, mes)
          break

        case 'game_save_draft':
          if (!this.gameMessages.has(data.game)) break
          mes = this.gameMessages.get(data.game)
          mes.edit({
            embed: {
              ...mes.embeds[0],
              fields: [ {
                name: 'Activity',
                value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} saved changes`
              } ]
            }
          })
          break

        case 'game_decline':
          if (!this.gameMessages.has(data.game)) break
          mes = this.gameMessages.get(data.game)
          mes.edit({
            embed: {
              ...mes.embeds[0],
              fields: [ {
                name: 'Activity',
                value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} declined this game.`
              } ],
              color: 0xAB3231,
              title: 'Done.',
              description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
            }
          })
          break

        case 'game_accept':
          if (!this.gameMessages.has(data.game)) break
          mes = this.gameMessages.get(data.game)
          mes.edit({
            embed: {
              ...mes.embeds[0],
              fields: [ {
                name: 'Activity',
                value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${user?.username ?? '*Someone*'} approved this game.`
              } ],
              color: 0x59AB31,
              title: 'Done.',
              description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
            }
          })
          break

        case 'manual_store_scrape':
          contentChannel.send({
            embed: {
              color: 0x2F3136,
              title: `${user?.username ?? '*Someone*'} initiated manual store scraping. Target: ${data.store}`
            }
          })
          break

        case 'service_status':
          // eslint-disable-next-line no-case-declarations
          const colors = { fatal: 0xED1A52, rebooting: 0x3586E8, offline: 0xDB6D42, timeout: 0xDB9C1F, partial: 0xE3E352, ok: 0x52E36F }
          servicesChannel.send({
            embed: {
              color: colors[data.status] || 0x2F3136,
              title: `Service ${data.service}/${data.suid} is now \`${data.status}\``
            }
          })
          break

        default:
          contentChannel.send({
            embed: {
              color: 0x2F3136,
              title: `Unknown raw event: ${event}`
            }
          })
          break
      }
    })
  }

  private findReply(prompt: string): string {
    if (!prompt) return ''
    const args = prompt.split(' ')
    switch (args[0]) {
      case '--list':
        return [
          'here',
          'free, freetheme, notheme',
          'late, delay',
          'since, added, time',
          'setup, howto, guide',
          'translations, translation, lang, language .. <language name>',
          'memberlist, online',
          'status, maintenance, difficulties',
          'themes',
          'api',
          'shutup',
          'suggestions',
          'memes',
          'donos, donations, donate',
          'nochannel',
          'nowrite',
          'test',
          'known, aware, ontheway, yupp'
        ].join('\n')
      case 'here':
        return 'Please run the command `@FreeStuff here` in your server. This gives us some insight to help troubleshoot your problem!'
      case 'free':
      case 'freetheme':
      case 'notheme':
        return 'The `@FreeStuff free` command doesn\'t use the theme you set up. It\'s meant as a quick overview to see all available games in a compact message.'
      case 'late':
      case 'delay':
        return 'Because there\'s a lot of people using the bot it takes a while to send the game to every server. Please hold on a bit it should get announced on yours soon :smile:'
      case 'since':
      case 'added':
      case 'time':
        return 'When did you add the bot to your server? If it was very recently there might just not have been any game free in that period.'
      case 'howto':
      case 'guide':
      case 'setup':
        return 'We have a guide prepared to walk you through the entire setup: <https://freestuffbot.xyz/guide/>\nBesides that you can always run `@FreeStuff help` for a full list of available commands!'
      case 'translations':
      case 'translation':
      case 'lang':
      case 'language':
        return args[1]
          ? `We have a translation for ${args[1]} available! To make the bot use it, run \`@FreeStuff set language ${args[1]}\` in your server!`
          : 'We have a lot of translations available, to see them all run `@FreeStuff set language` in your server!'
      case 'memberlist':
      case 'online':
        return 'Does the bot show up in your member list on the right? If not the bot is missing the `Read Messages` permission, make sure the bot can read and write messages in that channel!'
      case 'status':
      case 'maintenance':
      case 'difficulties':
        return 'We\'re currently undergoing either maintenance or technical difficulties, more info can be found in <#709374924422250498>. Sorry for the inconvenience!'
      case 'themes':
        return 'The bot has a large variety of customisation options available that change the appearance of the bot\'s messages. Themes can be found at <https://freestuffbot.xyz/themes>'
      case 'api':
        return 'We do have an API! Check out the docs at <https://docs.freestuffbot.xyz/>'
      case 'shutup':
        return 'Please, shut up.'
      case 'suggestions':
        return 'Suggestions go in <#709374997159870566>, please!'
      case 'memes':
        return 'Memes go in <#835922274350923786>, please!'
      case 'donos':
      case 'donations':
      case 'donate':
        return 'Donations are always welcome!\nVia Patreon: <https://freestuffbot.xyz/o/patreon>\nVia Ko-Fi: <https://freestuffbot.xyz/o/ko-fi>\nOr for more info: <https://freestuffbot.xyz/donate>'
      case 'nochannel':
        return 'Alright, looks like you don\'t have any channel configured for the bot to send the messages to. Please take a look at our guide on how to set the bot up properly: <https://freestuffbot.xyz/guide/>'
      case 'nowrite':
        return 'Alright, looks like the bot doesn\'t have permission to send messages in that channel, please check that again!'
      case 'test':
        return 'You can run a test announcement with `@FreeStuff test` to check if everything is setup properly!'
      case 'known':
      case 'aware':
      case 'ontheway':
      case 'yupp':
        return 'Thanks! The messages are already on the way!'
    }
    return ''
  }

  private async allocateWebhook(channel: TextChannel): Promise<Webhook> {
    const existing = await channel.fetchWebhooks()
    if (existing.size)
      return existing.first()
    else
      return channel.createWebhook('TudeBot Webhook')
  }

}
