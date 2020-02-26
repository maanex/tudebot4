import { User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command, CommandExecEvent, ReplyFunction } from "../types";
import { ItemList } from "../thirdparty/tudeapi/itemlist";


export default class ItemInfoCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'iteminfo',
      [ ],
      'Iteminfo',
      0,
      false,
      true,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (!args[0]) {
      repl('Missing Item name!');
      return false;
    }

    let item = ItemList.find(i => {
      if (i.id.toLowerCase() == args[0].toLowerCase()) return true;
      if (TudeApi.clubLang['item_'+i.id]) {
        if ((TudeApi.clubLang['item_'+i.id]).toLowerCase() == args.join(' ').toLowerCase())
          return true;
      }
      return false;
    });
    if (!item) {
      item = ItemList.find(i => {
        if (TudeApi.clubLang['item_'+i.id]) {
          if ((TudeApi.clubLang['item_'+i.id]).toLowerCase().includes(args.join(' ').toLowerCase()))
            return true;
        }
        return false;
      });
    }

    repl('```json\n' + JSON.stringify(item, null, 2) + '```');
    return !!item;
  }

}
