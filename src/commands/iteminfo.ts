import { User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command, CommandExecEvent, ReplyFunction } from "../types";
import { ItemList } from "../thirdparty/tudeapi/itemlist";
import ParseArgs from "../util/parseArgs";


export default class ItemInfoCommand extends Command {

  constructor() {
    super({
      name: 'iteminfo',
      description: 'Iteminfo',
      aliases: [ 'item' ],
      hideOnHelp: true,
      groups: [ 'club', 'info' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (!args[0]) {
      repl('What item are you looking for?', 'bad', 'Type `item <name>` and replace <name> with the item\'s name!');
      return false;
    }
    let cmdl = ParseArgs.parse(args);

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

    if (cmdl.r || cmdl.raw) {
      repl('```json\n' + JSON.stringify(item, null, 2) + '```');
      return !!item;
    }

    if (!item) {
      repl(`No item by the name ${args.join(' ')} found!`, 'bad');
      return;
    }

    const name = TudeApi.clubLang['item_'+item.id];

    channel.send({ embed: {
      title: `${item.icon} ${name}`,
      description: `\`${item.id}\``,
      fields: [
        {
          name: 'Properties',
          value: [
            ['Stackable', !item.expanded],
            ['Tradeable', item.tradeable],
            ['Sellable', item.sellable],
            ['Purchaseable', item.purchaseable],
          ].map(i => `${i[1]?'🗹':'☐'} ${i[0]}`).join('\n'),
          inline: true
        },
        {
          name: 'Category',
          value: item.category.namepl || 'Unknown',
          inline: true
        },
        {
          name: 'Group',
          value: item.group.namepl || 'Unknown',
          inline: true
        }
      ],
      color: 0x2f3136,
      footer: { text: `@${user.tag}` }
    }});

    return !!item;
  }

}
