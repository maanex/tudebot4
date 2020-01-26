"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'beta',
    aliases: [],
    desc: 'Join the TudeBot Beta program',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        repl(mes.channel, mes.author, 'Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
        return true;
    }
};
//# sourceMappingURL=beta.js.map