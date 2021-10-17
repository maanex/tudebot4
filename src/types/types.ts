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
    public readonly guilds: Map<string, any>,

    protected readonly lang: (key: string, params?: { [key: string]: string }) => string
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

export type CommandExecEvent = { message: Message, sudo: boolean, label: string, awaitUserResponse: AwaitUserResponseFunction };

export type CommandGroup = 'fun' | 'images' | 'apiwrapper' | 'rng' | 'internal' | 'club' | 'easteregg' | 'casino' | 'info' | 'moderation';

export interface CommandSettings {

  name: string;
  aliases?: string[];
  description: string;
  cooldown?: number;
  groups?: CommandGroup[];
  sudoOnly?: boolean;
  hideOnHelp?: boolean;

}

export abstract class Command {

  public lang: (key: string) => string;
  public resetCooldown: (user: User) => void;

  constructor(
    public readonly settings: CommandSettings
  ) {
    if (!settings.aliases) settings.aliases = []
    if (!settings.cooldown) settings.cooldown = 0
    if (!settings.groups) settings.groups = []
    if (!settings.hideOnHelp) settings.hideOnHelp = false
    if (!settings.sudoOnly) settings.sudoOnly = false
  }

  public get name(): string { return this.settings.name }
  public get aliases(): string[] { return this.settings.aliases }
  public get description(): string { return this.settings.description }
  public get cooldown(): number { return this.settings.cooldown }
  public get groups(): string[] { return this.settings.groups }
  public get sudoOnly(): boolean { return this.settings.sudoOnly }
  public get hideOnHelp(): boolean { return this.settings.hideOnHelp }

  public abstract execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean | Promise<boolean>;

  public init() { }

}

export interface UserResponseWaiting {
  user: User,
  channel: TextChannel,
  callback: UserResponseCallback,
  timeout: NodeJS.Timeout
}

//

export type ModlogFunction = (guild: Guild, type: modlogType, text: string) => void
