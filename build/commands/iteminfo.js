"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
const itemlist_1 = require("../thirdparty/tudeapi/itemlist");
class ItemInfoCommand extends types_1.Command {
    constructor(lang) {
        super('iteminfo', [], 'Iteminfo', 0, false, true, lang);
    }
    execute(channel, user, args, event, repl) {
        if (!args[0]) {
            repl('Missing Item name!');
            return false;
        }
        let item = itemlist_1.ItemList.find(i => {
            if (i.id.toLowerCase() == args[0].toLowerCase())
                return true;
            if (tudeapi_1.default.clubLang['item_' + i.id]) {
                if ((tudeapi_1.default.clubLang['item_' + i.id]).toLowerCase() == args.join(' ').toLowerCase())
                    return true;
            }
            return false;
        });
        if (!item) {
            item = itemlist_1.ItemList.find(i => {
                if (tudeapi_1.default.clubLang['item_' + i.id]) {
                    if ((tudeapi_1.default.clubLang['item_' + i.id]).toLowerCase().includes(args.join(' ').toLowerCase()))
                        return true;
                }
                return false;
            });
        }
        repl('```json\n' + JSON.stringify(item, null, 2) + '```');
        return !!item;
    }
}
exports.default = ItemInfoCommand;
//# sourceMappingURL=iteminfo.js.map