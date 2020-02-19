"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'gamemode',
    aliases: [
        '/gamemode'
    ],
    desc: 'Gamemode',
    sudoonly: false,
    hideonhelp: true,
    execute(bot, mes, sudo, args, repl) {
        if (args.length == 0) {
            mes.reply('/gamemode <gamemode>');
            return false;
        }
        switch (args[0]) {
            case '0':
            case 'survival':
                mes.reply('Gamemode set to Survival');
                break;
            case '1':
            case 'creative':
                mes.reply('Gamemode set to Creative');
                break;
            case '2':
            case 'adventure':
                mes.reply('Gamemode set to Adventure');
                break;
            case '3':
            case 'spectator':
                mes.reply('Gamemode set to Spectator');
                break;
            default:
                mes.reply('Gamemode ' + args[0] + ' not found!');
                return false;
        }
        return true;
    }
};
//# sourceMappingURL=gamemode.js.map