import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'sourcecode',
    aliases: [
    ],
    desc: 'A link to the Bot\'s source code.',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, content?: string) => void): boolean {
        repl(mes.channel, mes.author, 'The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4');
        return true;
    }

}