import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class BetaCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'beta',
      [ ],
      'Join the TudeBot Beta program',
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
    return true;
  }

}
