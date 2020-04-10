import { User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command, CommandExecEvent, ReplyFunction } from "../types";
import { ItemList, findItem } from "../thirdparty/tudeapi/itemlist";
import ParseArgs from "../util/parseArgs";
import { Item } from "../thirdparty/tudeapi/item";


export default class ItemCommand extends Command {

  constructor() {
    super({
      name: 'item',
      description: 'View an item in your inventory',
      groups: [ 'club' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (!args[0]) {
      repl('What item are you looking for?', 'bad', 'Type `item <name>` and replace <name> with the item\'s name!');
      return false;
    }
    let cmdl = ParseArgs.parse(args);

    TudeApi.clubUserByDiscordId(user.id, user).then(u => {
      if (!u || u.error) {
        repl('An error occured!', 'error');
        return;
      }

      if (!u.inventory.has(args[0])) {
        repl(`You don't appear to have "${args[0]}" in your inventory!`, 'bad');
        return;
      }

      const item = u.inventory.get(args[0]);
    }).catch(console.error);

    const item = findItem(args.join(' '));
    
    if (cmdl.r || cmdl.raw) {
      repl('```json\n' + JSON.stringify(item, null, 2) + '```');
      return !!item;
    }

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
