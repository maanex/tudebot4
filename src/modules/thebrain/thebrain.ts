import * as nreq from 'request'
import { Wit } from 'node-wit'
import { Module } from '../../types/types'
import { config, TudeBot } from '../../index'


/** This is some wild sh*t */
export default class TheBrainModule extends Module {

  private timeouts = [];

  public witClient;


  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('The Brain', '🧠', 'Gives the bot personality', 'Enabling this module will affect other modules too. The bot will gain its own personality of sorts, which makes things a little less formal and a little more funny.', 'public', conf, data, guilds)

    this.witClient = new Wit({
      accessToken: config.thirdparty.wit.token
    })
  }

  public onEnable() {
    // TudeBot.on('message', (mes: Message) => {
    //   if (mes.author.bot) return
    // })
  }

  public onBotReady() {
    setTimeout(() => this.setPlaytext(), 1000)
    setTimeout(() => this.setNewIcon(), 1000)
  }

  public onDisable() {
    this.timeouts.forEach(clearTimeout)
    this.timeouts = []
  }

  private downloadAllImages() {
    const all = this.data.icons.random
    let i = 0
    for (const url of all) {
      const request = nreq.defaults({ encoding: null })
      request.get(url, function (err, _res, body) {
        if (err) return
        if (!body) return

        const b = body.toString('base64').replace(/^data:image\/png;base64,/, '')
        require('fs').writeFile(`C:\\Users\\andre\\Desktop\\out\\img_${i++}.png`, b, 'base64', function (err) {
          console.log(err)
        })
        console.log(`Image ${i} exportiert`)
      })
    }
  }

  private setNewIcon(timeoutonly: boolean = true) {
    if (!timeoutonly) {
      // const request = nreq.defaults({ encoding: null })
      // request.get(this.getIconUrl(), function (err, res, body) {
      //   if (err) return
      //   if (!body) return

      //   // bot.user.setAvatar(body);
      //   // (bot.guilds.get('342620626592464897').channels.get('487263535064154113') as TextChannel).sendFile(body);
      // })
    }
    const sixH = 6 * 60 * 60 * 1000
    this.timeouts.push(setTimeout(() => this.setNewIcon(false), sixH + Math.floor(Math.random() * sixH * 5)))
  }

  private setPlaytext() {
    TudeBot.user.setActivity(this.getText())
    this.timeouts.push(setTimeout(() => this.setPlaytext(), 1 * 60 * 1000 + Math.floor(Math.random() * 3 * 60 * 60 * 1000)))
  }

  private getText(): string {
    const all = this.data.texts
    let category = 'info'
    if (Math.random() < 0.5) category = 'stuff'
    if (Math.random() < 0.7) category = 'random'
    const list = all[category]
    const text = list[Math.floor(Math.random() * list.length)]
    return text
  }

  private getIconUrl(): string {
    const all = this.data.icons
    let category = 'random'
    if (Math.random() < 0.7) category = 'random'
    const list = all[category]
    const icon = list[Math.floor(Math.random() * list.length)]
    return icon
  }

}
