import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { Command, CommandExecEvent, ReplyFunction } from "../types";


export default class GamemodeCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'gamemode',
      [ '/gamemode' ],
      'by Mojang',
      0,
      false,
      true,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (args.length == 0) {
      event.message.reply('/gamemode <gamemode>');
      return false;
    }
    switch (args[0]) {
      case '0':
      case 'survival':
        event.message.reply('Gamemode set to Survival');
        break;

      case '1':
      case 'creative':
        event.message.reply('Gamemode set to Creative');
        break;

      case '2':
      case 'adventure':
        event.message.reply('Gamemode set to Adventure');
        break;

      case '3':
      case 'spectator':
        event.message.reply('Gamemode set to Spectator');
        break;

      default:
        event.message.reply('Gamemode ' + args[0] + ' not found!');
        return false;
    }
    return true;
  }

}
