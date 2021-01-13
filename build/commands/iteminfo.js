"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
const itemlist_1 = require("../content/itemlist");
const parse_args_1 = require("../util/parse-args");
class ItemInfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'iteminfo',
            aliases: ['ii', 'finditem', 'itemsearch'],
            description: 'Get basic information about any item',
            groups: ['club', 'info']
        });
    }
    execute(channel, user, args, _event, repl) {
        if (!args[0]) {
            repl('What item are you looking for?', 'bad', 'Type `iteminfo <name>` and replace <name> with the item\'s name!');
            return false;
        }
        const cmdl = parse_args_1.default.parse(args);
        const item = itemlist_1.findItem(args.join(' '));
        if (cmdl.r || cmdl.raw) {
            repl('```json\n' + JSON.stringify(item, null, 2) + '```');
            return !!item;
        }
        if (!item) {
            repl(`No item by the name **${args.join(' ')}** found!`, 'bad');
            return false;
        }
        const name = tudeapi_1.default.clubLang['item_' + item.id];
        channel.send({
            embed: {
                title: `${item.icon} ${name}`,
                description: `\`${item.id}\``,
                fields: [
                    {
                        name: 'Description',
                        value: tudeapi_1.default.clubLang['itemdesc_' + item.id] || 'No description found!'
                    },
                    {
                        name: 'Properties',
                        value: [
                            ['Stackable', !item.expanded],
                            ['Tradeable', item.tradeable],
                            ['Sellable', item.sellable],
                            ['Purchaseable', item.purchaseable]
                        ].map(i => `${i[1] ? '🗹' : '☐'} ${i[0]}`).join('\n'),
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
                color: 0x2F3136,
                footer: { text: `@${user.tag}` }
            }
        });
        return true;
    }
}
exports.default = ItemInfoCommand;
//# sourceMappingURL=iteminfo.js.map