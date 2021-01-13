import { TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Module } from '../types/types'


export default class ClubBulletinBoardModule extends Module {

  private channels: TextChannel[] = [];


  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Club Bulletin Board', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public async onBotReady() {
    for (const guildid of this.guilds.keys()) {
      const guild = await TudeBot.guilds.fetch(guildid)
      if (!guild) return
      for (const channelid of this.guilds.get(guildid).channels) {
        const channel = guild.channels.resolve(channelid)
        if (!channel) return
        this.channels.push(channel as TextChannel)
      }
    }


  }

  public onDisable() {
  }

  private update(channel: TextChannel) {
    channel.messages.fetch().then((mes) => {
      if (mes.size) {
        for (const m of mes.array())
          if (m.author.id !== TudeBot.user.id) continue
      } else {
        TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`')
      }
    }).catch((err) => {
      TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated! Error: ```' + err + '```')
    })
  }

}
