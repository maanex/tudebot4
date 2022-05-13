/* eslint-disable no-undef */
import { Channel, User, Guild, TextChannel, Message } from 'discord.js'

//

export type modlogType = 'userJoin' | 'userQuit' | 'message' | 'cleanChat' | 'diverse' | 'punish' | 'warning' | 'reload';

export type cmesType = modlogType | 'error' | 'bad' | 'title' | 'success';

export type cmes = (channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) => {};


//

export type ReplyFunction = (text: string, type?: cmesType, description?: string, settings?: any) => void;

export type ModuleUsageScope = 'private' | 'public';

export abstract class Module {

  // eslint-disable-next-line no-useless-constructor
  constructor(
    public readonly name: string,
    public readonly emoji: string,
    public readonly info: string,
    public readonly description: string,
    public readonly usageScope: ModuleUsageScope,
    public readonly conf: any,
    public readonly data: any,
    public readonly guilds: Map<string, any>
  ) { }

  public abstract onEnable(): void;

  public abstract onBotReady(): void;

  public abstract onDisable(): void;

  //

  protected isMessageEventValid(mes: Message): boolean {
    if (mes.author.bot) return false
    if (!mes.guild) return false
    if (!this.isEnabledInGuild(mes.guild)) return false
    return true
  }

  protected isEnabledInGuild(guild: Guild): boolean {
    if (!guild) return false
    return this.guilds.has(guild.id)
  }

  protected guildData(guild: Guild): any {
    return this.isEnabledInGuild(guild) ? this.guilds.get(guild.id) : {}
  }

}

export interface GuildSettings {

  id: string;
  name: string;
  club: boolean;
  managers: { [userid: string]: string[] }
  modules: { [moduleid: string]: any }

}

//

export type UserResponseCallback = (mes: Message) => void

export type AwaitUserResponseFunction = (user: User, channel: TextChannel, timeout: number, callback: UserResponseCallback) => void


export interface UserResponseWaiting {
  user: User,
  channel: TextChannel,
  callback: UserResponseCallback,
  timeout: NodeJS.Timeout
}

//

export type ModlogFunction = (guild: Guild, type: modlogType, text: string) => void
