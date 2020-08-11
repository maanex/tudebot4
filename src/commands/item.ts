import { User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command, CommandExecEvent, ReplyFunction } from "../types/types";
import { ItemList, findItem } from "../content/itemlist";
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

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!args[0]) {
        repl('What item are you looking for?', 'bad', 'Type `item <name>` and replace <name> with the item\'s name!');
        return false;
      }
      let cmdl = ParseArgs.parse(args);
  
      TudeApi.clubUserByDiscordId(user.id, user).then(async u => {
        if (!u || u.error) {
          repl('An error occured!', 'error');
          return false;
        }
  
        if (!u.inventory.has(args[0])) {
          repl(`You don't appear to have **${args[0]}** in your inventory!`, 'bad');
          return false;
        }
  
        const item = u.inventory.get(args[0]);

        channel.send({ embed: {
          title: `${item.prefab.icon} ${item.prefab.expanded ? '' : `**${item.amount}x** `}${item.name}`,
          description: `\`${item.id}\`\n${item.description}`,
          fields: await item.renderMetadata(),
          color: 0x2f3136,
          footer: { text: `@${user.tag}` }
        }});
        return true;
      }).catch(console.error);
    });
  }

}
