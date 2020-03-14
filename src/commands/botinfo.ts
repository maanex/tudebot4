import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class BotInfoCommand extends Command {

  constructor() {
    super({
      name: 'botinfo',
      aliases: [ 'test1234' ],
      description: 'Bot info',
      cooldown: 0,
      groups: [ ],
      sudoOnly: true,
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    return true;
  }

}
