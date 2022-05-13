import { Module } from '../types/types'


export default class DataModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Data Holder', '❓', 'internal', 'internal', 'private', conf, data, guilds)
  }

  public onEnable() {
  }

  public onBotReady() {
  }

  public onDisable() {
  }

}
