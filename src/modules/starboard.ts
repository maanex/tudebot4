import { Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, TextChannel, User } from 'discord.js'
import { MessageButtonStyles, MessageComponentTypes } from 'discord.js/typings/enums'
import { TudeBot } from '../index'
import Webhooks from '../lib/webhooks'
import { Module } from '../types/types'


export default class StarboardModule extends Module {

  private pinned: Set<string>

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Starboard', '⭐', 'World famous star board!', 'React to a message with ⭐ to put it up the starboard!', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    TudeBot.on('messageReactionAdd', (a: MessageReaction, b: User) => this.onReact(a, b))
    this.pinned = new Set()
  }

  public onBotReady() {
  }

  public onDisable() {
  }

  private async onReact(reaction: MessageReaction | PartialMessageReaction, _user: User | PartialUser) {
    if (!reaction.message?.guild) return
    if (!this.isEnabledInGuild(reaction.message.guild)) return

    const data = this.guildData(reaction.message.guild)
    const channel = data.channel
      ? await TudeBot.channels.fetch(data.channel) as TextChannel
      : null
    if (!channel) return
    if (reaction.message.channel.id === data.channel) return

    const isEmoji = reaction.emoji.name
    const reqEmoji = data.emoji ?? '⭐'
    if (isEmoji !== reqEmoji) return

    const isAmount = reaction.count
    const reqAmount = data.minAmount || 1
    // if (isAmount < reqAmount) return
    if (isAmount !== reqAmount) return

    if (this.pinned.has(reaction.message.id)) return

    this.pin(reaction.message, channel, isAmount, isEmoji)
    this.pinned.add(reaction.message.id)
  }

  private async pin(message: Message | PartialMessage, toChannel: TextChannel, _pinCount: number, pinEmoji: string) {
    const webhook = await Webhooks.allocateWebhook(toChannel)

    let content = message.content
    for (const file of message.attachments.values())
      content += `\n${file.url}`
    if (message.author?.bot && message.embeds?.length) {
      const word = (message.embeds.length === 1) ? 'embed' : 'embeds'
      const plus = content?.length ? '+' : ''
      content += `\n[${plus}${message.embeds.length} ${word}]`
    }

    if (!content) return

    webhook.send({
      content,
      avatarURL: message.author.avatarURL(),
      username: message.member?.nickname || message.author.username,
      allowedMentions: { parse: [] },
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            // {
            //   type: MessageComponentTypes.BUTTON,
            //   style: MessageButtonStyles.SECONDARY,
            //   customId: CordoAPI.compileCustomId('starboard_pin_count_dummy', [ InteractionComponentFlag.ACCESS_EVERYONE ]),
            //   // label: pinCount.toString(),
            //   emoji: pinEmoji
            // },
            {
              type: MessageComponentTypes.BUTTON,
              style: MessageButtonStyles.LINK,
              url: message.url,
              label: 'View Original'
            }
          ]
        }
      ]
    })
  }

}
