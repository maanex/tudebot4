/* eslint-disable no-undef */
import { TextChannel } from 'discord.js'
import * as cron from 'cron'
import axios from 'axios'
import { Module } from '../types/types'
import { TudeBot } from '../index'


export default class DailyTopicModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';
  private cronjob: cron.CronJob;

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Daily Topic', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    // TODO enable below for non debug
    // this.cronjob = cron.job('0 0 * * *', () => this.run())
    this.cronjob = cron.job('* * * * *', () => this.run())
    this.cronjob.start()
  }

  public onBotReady() {
  }

  public onDisable() {
    clearInterval(this.interval)
    this.interval = undefined
    this.cronjob?.stop()
  }

  private async run() {
    for (const g of this.guilds.keys()) {
      const guild = TudeBot.guilds.resolve(g)
      if (!guild) continue
      const channel = guild.channels.resolve(this.guilds.get(g).channel)
      if (!channel || channel.type !== 'text') continue;
      (channel as TextChannel).send(await this.generateTopic(g))
    }
  }

  private generateTopic(guildid: string): Promise<string> {
    // TODO save last week of topics in an array to not get the same kind of topic too many times in a row

    const kind = 'dayfact' // findKind()
    return this.topics[kind]()
  }

  //

  private topics: { [topic: string]: () => Promise<string> } = {
    dayfact: async () => {
      const { data } = await axios.get(`http://numbersapi.com/${new Date().getMonth() + 1}/${new Date().getDate()}/date`)
      return data
    }
  }

}
