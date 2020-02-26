"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class GamemodeCommand extends types_1.Command {
    constructor(lang) {
        super('gamemode', ['/gamemode'], 'by Mojang', 0, false, true, lang);
    }
    execute(channel, user, args, event, repl) {
        if (args.length == 0) {
            event.message.reply('/gamemode <gamemode>');
            return false;
        }
        switch (args[0]) {
            case '0':
            case 'survival':
                event.message.reply('Gamemode set to Survival');
                break;
            case '1':
            case 'creative':
                event.message.reply('Gamemode set to Creative');
                break;
            case '2':
            case 'adventure':
                event.message.reply('Gamemode set to Adventure');
                break;
            case '3':
            case 'spectator':
                event.message.reply('Gamemode set to Spectator');
                break;
            default:
                event.message.reply('Gamemode ' + args[0] + ' not found!');
                return false;
        }
        return true;
    }
}
exports.default = GamemodeCommand;
//# sourceMappingURL=gamemode.js.map