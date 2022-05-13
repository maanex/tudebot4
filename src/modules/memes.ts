import { Message, MessageReaction, User, TextChannel } from 'discord.js'
import { CronJob } from 'cron'
import axios from 'axios'
import { TudeBot } from '../index'
import { Module } from '../types/types'
import { DbStats } from '../database/dbstats'
import Database from '../database/database'
import Emojis from '../lib/emojis'
import Localisation from '../lib/localisation'


export default class MemesModule extends Module {

  private readonly RATINGS = {
    '⭐': +3,
    '🔥': +2,
    '⬆️': +1,
    '⬇️': -1,
    '💩': -2
  };

  private selfUpvoteCooldown: string[] = [];

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Memes', '🗿', 'Adds memes channels', 'With this module you can turn text channels into meme channels which give every meme posted there upvote and downvote buttons as well as one to save the meme in your dms', 'public', conf, data, guilds)
  }

  public onEnable() {
    TudeBot.on('message', async (mes) => {
      try {
        if (!mes) return
        if (!this.isMessageEventValid(mes)) return
        if (!mes.attachments.size) return
        if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return

        DbStats.getUser(mes.author).then(u => u.memesSent++)

        const emojis = Object.keys(this.RATINGS)

        if (` ${mes.content} `.includes(' f '))
          emojis.push(':pay_respect:496359590087098409')

        if (mes.content.match(/doo+t/i))
          emojis.push(':doot:496770649562415115')

        if (mes.content.match(/dank/i))
          emojis.push('🇩', '🇦', '🇳', '🇰')

        for (const me of [ 'meirl', 'me irl', 'me_irl', 'ichiel', 'ich_iel', 'ich iel' ]) {
          if (mes.content.toLowerCase().includes(me)) {
            emojis.push(':meirl:496357154199044097')
            break
          }
        }

        if (Math.floor(Math.random() * 500) === 0) {
          const gif = ([ 'https://cdn.discordapp.com/attachments/497071913718382604/497071937772847104/giphy.gif',
            'https://cdn.discordapp.com/attachments/497071913718382604/497071942323666945/giphy2.gif',
            'https://cdn.discordapp.com/attachments/497071913718382604/497071959595548683/giphy3.gif' ])[Math.floor(Math.random() * 3)]
          mes.channel.send({
            embeds: [
              {
                color: 0x2F3136,
                image: { url: gif }
              }
            ]
          })
        }

        if (this.guildData(mes.guild).motm && this.guildData(mes.guild).channels[0] === mes.channel.id) {
          Database
            .collection('memes')
            .insertOne({
              _id: mes.id,
              author: mes.author.id,
              caption: mes.content,
              image: mes.attachments.first().url,
              rating: 0
            })
            .catch(console.error)
        }

        for (const e of emojis) {
          try {
            // const mes2 = await mes.channel.messages.fetch(mes.id)
            // await mes2.react(e).catch(console.error)
            const encoded = e.startsWith(':')
              ? e.substring(1)
              : encodeURIComponent(e)
            await axios.put(
              `https://discord.com/api/v9/channels/${mes.channelId}/messages/${mes.id}/reactions/${encoded}/@me`,
              {},
              {
                headers: {
                  Authorization: `Bot ${TudeBot.token}`
                }
              }
            )
            await new Promise((res: any) => setTimeout(res, 1500))
          } catch (ex) {
            console.error(ex)
          }
        }
      } catch (ex) {
        console.error(ex)
      }
    })

    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      const mes = reaction.message as Message
      if (!mes) return
      if (user.bot) return
      if (mes.author.bot) return
      if (!mes.guild) return
      if (!this.isEnabledInGuild(mes.guild)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return
      if (!mes.attachments.size) return

      if (this.RATINGS[reaction.emoji.name]) {
        const rating = this.RATINGS[reaction.emoji.name]
        if (rating > 0 && reaction.emoji.name !== '⭐' && mes.author.id === user.id && !this.selfUpvoteCooldown.includes(mes.author.id)) {
          const text = Localisation.text('en-US', 'meme_upvote_own_post', {
            user: user.toString(),
            username: user.username,
            not_cool: Emojis.notCool.string
          })
          mes.channel.send(text)
          this.selfUpvoteCooldown.push(mes.author.id)
          setTimeout(() => this.selfUpvoteCooldown.splice(this.selfUpvoteCooldown.indexOf(mes.author.id), 1), 1000 * 60 * 5)
        }
      }

      this.updateMemeRating(mes)

      if (reaction.emoji.name === '⭐') {
        user.send({
          embeds: [
            {
              color: 0x2F3136,
              image: { url: mes.attachments.first().url },
              description: `[${mes.content || '[link]'}](https://discordapp.com/channels/${mes.guild.id}/${mes.channel.id}/${mes.id})`,
              footer: { text: `Uploaded by ${mes.author.username}` },
              timestamp: mes.createdTimestamp
            }
          ]
        })
      }
    })

    TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
      const mes = reaction?.message as Message
      if (!mes) return
      if (user.bot) return
      if (mes.author.bot) return
      if (!mes.guild) return
      if (!this.isEnabledInGuild(mes.guild)) return
      if (!this.guildData(mes.guild).channels.includes(mes.channel.id)) return
      if (!mes.attachments.size) return

      this.updateMemeRating(mes)
    })
  }

  updateMemeRating(mes: Message) {
    if (this.guildData(mes.guild).motm && this.guildData(mes.guild).channels[0] === mes.channel.id) {
      let rating = -Object.values(this.RATINGS).reduce((a, b) => a + b, 0)
      for (const reaction of mes.reactions.cache.values()) {
        if (this.RATINGS[reaction.emoji.name])
          rating += this.RATINGS[reaction.emoji.name] * reaction.count
      }
      Database
        .collection('memes')
        .updateOne({ _id: mes.id }, {
          $set: {
            rating
          }
        })
    }
  }

  private cronjobs: CronJob[] = [];

  public onBotReady() {
    //                           m h d m dw
    this.cronjobs.push(new CronJob('0 6 1 * *', () => this.electMemeOfTheMonth()))

    this.cronjobs.forEach(c => c.start())
  }

  public onDisable() {
    this.cronjobs.forEach(j => j.stop())
    this.cronjobs = []
  }

  public async electMemeOfTheMonth() {
    const top5: {
      _id: string,
      author: string,
      caption: string,
      image: string,
      rating: number,
      message: Message
    }[] = await Database
      .collection('memes')
      .find({ }, {
        sort: { rating: -1 },
        limit: 5
      })
      .toArray()

    if (!top5.length) return

    this.guilds.forEach(async (data, gid) => {
      if (data.motm) {
        const guild = TudeBot.guilds.resolve(gid)
        if (!guild) return
        const channel = guild.channels.resolve(data.channels[0]) as TextChannel
        for (const meme of top5)
          meme.message = await channel.messages.fetch(meme._id)

        while (top5.length && !top5[0].message) top5.splice(0, 1)
        if (!top5.length) return

        const now = new Date()
        channel.send({
          embeds: [ {
            title: `Meme Of The Month • ${Localisation.getRaw('en-US', 'meme_month_' + ((now.getMonth() + 11) % 12))} ${now.getFullYear()}`,
            description: `by ${top5[0].message.author} (▲${top5[0].rating})` + (top5[0].caption ? `\n\n**${top5[0].caption}**` : ''),
            image: { url: top5[0].image },
            color: 0x2F3136
          } ]
        }).then(() => {
          const top1 = top5.splice(0, 1)[0]
          channel.send({
            embeds: [
              {
                fields: [ {
                  name: 'Honorable Mentions',
                  value: top5.map((v, i) => `[**#${i + 2}**](https://discordapp.com/channels/${gid}/${channel.id}/${v.message.id}) by ${v.message.author} (▲${v.rating})`).join('\n')
                } ],
                color: 0x2F3136
              }
            ]
          }).then(() => {
            if (!top1.message.pinned && top1.message.pinnable)
              top1.message.pin()

            Database
              .collection('memes')
              .deleteMany({ })
          })
        })
      }
    })
  }

}
