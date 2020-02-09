import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'open',
    aliases: [
        'o',
        'unbox'
    ],
    desc: 'Open a lootbox',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, content?: string) => void): boolean {
        repl(mes.channel, mes.author, 'This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it');
        return true;
    }

}