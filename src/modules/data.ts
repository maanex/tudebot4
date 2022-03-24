import { Module } from '../types/types'


export default class DataModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Data Holder', '❓', 'internal', 'internal', 'private', conf, data, guilds, lang)
  }

  public onEnable() {
  }

  public onBotReady() {
  }

  public onDisable() {
  }

}
