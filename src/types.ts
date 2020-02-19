import { Channel, User, Guild } from "discord.js";
import { Command } from "./modules/commands";
import { ClubUser } from "./thirdparty/tudeapi/tudeapi";
import { TudeBot } from "index";

//

export type modlogType = 'user_join' | 'user_quit' | 'message' | 'clean_chat' | 'diverse' | 'punish' | 'warning' | 'reload';

export type cmesType = modlogType | 'error' | 'bad' | 'title' | 'success';

export type cmes = (channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) => {};


//

export type ReplyFunction = (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void;

export type ModuleData = {
  commands?: {
    getCommands: () => Command[];
    getActiveInCommandsChannel: () => string[]
  };
  getpoints?: {
    onUserLevelup: (user: ClubUser, newLevel: number, rewards: any) => void
  };
  [key: string]: any;
};

export type ModuleUsageScope = 'private' | 'public';

export abstract class Module {

  constructor (
    public readonly dispName: string,
    public readonly usageScope: ModuleUsageScope,

    protected readonly bot: TudeBot,
    protected readonly conf: any,
    protected readonly data: any,
    protected readonly lang: (string) => string
  ) { }

  public abstract onEnable(): void;

  public abstract onBotReady(): void;

  public abstract onDisable(): void;

}

//

export interface ModLog {
  log: (guild: Guild, type: modlogType, text: string) => void
}
