import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";


module.exports = {

    name: 'botinfo',
    aliases: [
        'test1234'
    ],
    desc: 'Bot info',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void) {
        
    }

}