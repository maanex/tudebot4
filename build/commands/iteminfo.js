"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
class ItemInfoCommand extends types_1.Command {
    constructor(lang) {
        super('iteminfo', [], 'Iteminfo', false, true, lang);
    }
    execute(channel, user, args, event, repl) {
        let item;
        if (!args[0])
            item = 'No id specified';
        else
            item = tudeapi_1.default.items.find(i => i.id.toLowerCase() == args[0].toLowerCase() || i.name.toLowerCase() == args[0].toLowerCase());
        repl('```json\n' + JSON.stringify(item, null, 2) + '```');
        return !!item;
    }
}
exports.default = ItemInfoCommand;
//# sourceMappingURL=iteminfo.js.map