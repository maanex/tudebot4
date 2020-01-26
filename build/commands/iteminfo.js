"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const fetch = require('node-fetch');
module.exports = {
    name: 'iteminfo',
    aliases: [],
    desc: 'Iteminfo',
    sudoonly: false,
    hideonhelp: true,
    execute(bot, mes, sudo, args, repl) {
        let item;
        if (!args[0])
            item = 'No id specified';
        else
            item = tudeapi_1.default.items.find(i => i.id.toLowerCase() == args[0].toLowerCase() || i.name.toLowerCase() == args[0].toLowerCase());
        repl(mes.channel, mes.author, '```json\n' + JSON.stringify(item, null, 2) + '```');
        return !!item;
    }
};
//# sourceMappingURL=iteminfo.js.map