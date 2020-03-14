import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class SourcecodeCommand extends Command {

  constructor() {
    super({
      name: 'sourcecode',
      description: "A link to the Bot's source code.",
      groups: [ 'info' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4');
    return true;    
  }

}
