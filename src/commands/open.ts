import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class OpenCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'open',
      [ 'o',
        'unbox' ],
      'Open a lootbox',
      0,
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it');
    return true;
  }

}
