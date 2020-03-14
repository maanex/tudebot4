import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class ReloadCommand extends Command {

  constructor() {
    super({
      name: 'reload',
      description: 'Reload',
      sudoOnly: true,
      groups: [ 'internal' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    TudeApi.reload();
    TudeBot.reload().then(() => event.message.react('✅')).catch();
    return true;
  }

}
