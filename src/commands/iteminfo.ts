import { User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command, CommandExecEvent, ReplyFunction } from "../types/types";
import { ItemList, findItem } from "../content/itemlist";
import ParseArgs from "../util/parse-args";


export default class ItemInfoCommand extends Command {

  constructor() {
    super({
      name: 'iteminfo',
      aliases: [ 'ii', 'finditem', 'itemsearch' ],
      description: 'Get basic information about any item',
      groups: [ 'club', 'info' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (!args[0]) {
      repl('What item are you looking for?', 'bad', 'Type `iteminfo <name>` and replace <name> with the item\'s name!');
      return false;
    }
    let cmdl = ParseArgs.parse(args);

    const item = findItem(args.join(' '));
    
    if (cmdl.r || cmdl.raw) {
      repl('```json\n' + JSON.stringify(item, null, 2) + '```');
      return !!item;
    }

    if (!item) {
      repl(`No item by the name **${args.join(' ')}** found!`, 'bad');
      return false;
    }

    const name = TudeApi.clubLang['item_'+item.id];

    channel.send({ embed: {
      title: `${item.icon} ${name}`,
      description: `\`${item.id}\``,
      fields: [
        {
          name: 'Description',
          value: TudeApi.clubLang['itemdesc_'+item.id] || 'No description found!'
        },
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

    return true;
  }

}
