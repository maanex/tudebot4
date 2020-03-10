import { Channel, User, Guild, TextChannel, Message } from "discord.js";

//

export type modlogType = 'user_join' | 'user_quit' | 'message' | 'clean_chat' | 'diverse' | 'punish' | 'warning' | 'reload';

export type cmesType = modlogType | 'error' | 'bad' | 'title' | 'success';

export type cmes = (channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) => {};


//

export type ReplyFunction = (text: string, type?: cmesType, description?: string, settings?: any) => void;

export type ModuleUsageScope = 'private' | 'public';

export abstract class Module {

  constructor (
    public readonly dispName: string,
    public readonly usageScope: ModuleUsageScope,

    protected readonly conf: any,
    protected readonly data: any,
    protected readonly lang: (string) => string
  ) { }

  public abstract onEnable(): void;

  public abstract onBotReady(): void;

  public abstract onDisable(): void;

}

//

export type CommandExecEvent = { message: Message, sudo: boolean, label: string };

export abstract class Command {

  constructor (
    public readonly name: string,
    public readonly aliases: string[],
    public readonly description: string,
    public readonly cooldown: number,
    public readonly sudoOnly: boolean,
    public readonly hideOnHelp: boolean,

    protected readonly lang: (string) => string
  ) { }

  public abstract execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean | Promise<boolean>;

  public init(): void { }

}

//

export type modlogFunction = (guild: Guild, type: modlogType, text: string) => void;
