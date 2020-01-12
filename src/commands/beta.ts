import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'beta',
    aliases: [
    ],
    desc: 'Join the TudeBot Beta program',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, content?: string) => void): boolean {
        repl(mes.channel, mes.author, 'Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
        return true;
    }

}