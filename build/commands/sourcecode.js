"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'sourcecode',
    aliases: [],
    desc: 'A link to the Bot\'s source code.',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        repl(mes.channel, mes.author, 'The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4');
        return true;
    }
};
//# sourceMappingURL=sourcecode.js.map