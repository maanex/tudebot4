import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class UnavailableCommand extends Command {

  constructor() {
    super({
      name: '_unavailable',
      description: 'Default command for when a command is unavailable.',
      hideOnHelp: true,
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    repl('This command has been disabled.', 'bad');
    return true;
  }

}
