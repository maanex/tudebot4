import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class BotInfoCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'botinfo',
      [ 'test1234' ],
      'Bot info',
      true,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    return true;
  }

}
