import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'gamemode',
    aliases: [
        '/gamemode'
    ],
    desc: 'Gamemode',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, content?: string) => void): boolean {
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

}