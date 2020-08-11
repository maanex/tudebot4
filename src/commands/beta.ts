import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";


export default class BetaCommand extends Command {

  constructor() {
    super({
      name: 'beta',
      description: 'Join the TudeBot Beta program',
      groups: [ 'info' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
    return true;
  }

}
