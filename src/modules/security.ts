import { Module } from '../types/types'


export type SecurityConfig = {
  commands: {
    kick: {
      allowedRoles: string[]
      trusted: string
    }
    ban: {
      allowedRoles: string[]
      trusted: string
    }
  }
}

export default class SecurityModule extends Module {

  constructor(conf: any, data: any, guilds: Map<string, any>) {
    super('Secutiry', '👮', 'Adds options to secure TudeBot', 'This module does not do anything on it\'s own. Instead it allows you to configure other parts of TudeBot to regulate who has access to what.', 'public', conf, data, guilds)
  }

  public onEnable() {
  }

  public onBotReady() {
  }

  public onDisable() {
  }

}
