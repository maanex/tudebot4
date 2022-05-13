/* eslint-disable no-undef */
import { TextChannel } from 'discord.js'
import { Module } from '../types/types'
import { TudeBot } from '../index'
import Localisation from '../lib/localisation'


export default class HappyBirthdayModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';


  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Happy Birthday', '🍰', 'Makes sure you never forget about a birthday', 'This module will let your entire server know about important birthdays', 'private', conf, data, guilds)
  }

  public onEnable() {
  }

  public onBotReady() {
    const date = new Date()
    const dstr = date.getDate() + '-' + (date.getMonth() + 1)
    this.lastDay = dstr

    this.interval = setInterval(() => this.check(), 1000 * 60 * 60)
  }

  public onDisable() {
    clearInterval(this.interval)
    this.interval = undefined
  }

  private check() {
    const date = new Date()
    const dstr = date.getDate() + '-' + (date.getMonth() + 1)
    if (this.lastDay === dstr) return
    this.lastDay = dstr

    const maxdelay = 0// 1000 * 60 * 60 * 5; // 5h
    setTimeout((daystr, guilds, data) => {
      for (const g of guilds.keys()) {
        const users = []
        for (const user in data[g]) {
          if (data[g][user] === daystr)
            users.push(user)
        }
        if (!users.length) return
        const usrstr = users.map(u => `<@${u}>`).join(' & ')
        const text = Localisation.text('de', users.length > 1 ? 'birthday_message_mult' : 'birthday_message', { user: usrstr })

        const guild = TudeBot.guilds.resolve(g)
        if (!guild) continue
        const channel = guild.channels.resolve(guilds.get(g).channel)
        if (!channel || channel.type !== 'GUILD_TEXT') continue;
        (channel as TextChannel).send(`@everyone ${text}`)
      }
    }, Math.floor(Math.random() * maxdelay * 0), dstr, this.guilds, this.data)
  }

}
