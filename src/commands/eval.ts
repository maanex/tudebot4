import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";


module.exports = {

    name: 'eval',
    aliases: [ ],
    desc: 'Eval',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, desc?: string) => void): boolean {
        if (mes.author.id !== '137258778092503042') return false;

        try {
            repl(mes.channel, mes.author, eval(args.join(' ')));
            return true;
        } catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'message', '```' + ex + '```');
            return false;
        }
    }

}