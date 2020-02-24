import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class ItemInfoCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'iteminfo',
      [ ],
      'Iteminfo',
      false,
      true,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    let item;
    if (!args[0]) item = 'No id specified';
    else item = TudeApi.items.find(i => i.id.toLowerCase() == args[0].toLowerCase() || i.name.toLowerCase() == args[0].toLowerCase());
    repl('```json\n' + JSON.stringify(item, null, 2) + '```');
    return !!item;
  }

}
