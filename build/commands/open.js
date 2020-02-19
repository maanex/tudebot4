"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'open',
    aliases: [
        'o',
        'unbox'
    ],
    desc: 'Open a lootbox',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        repl(mes.channel, mes.author, 'This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it');
        return true;
    }
};
//# sourceMappingURL=open.js.map