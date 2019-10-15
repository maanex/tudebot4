import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";


module.exports = {

    name: 'eval',
    aliases: [ ],
    desc: 'Eval',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void) {
        if (mes.author.id !== '137258778092503042') return;

        try {
            repl(mes.channel, mes.author, eval(args.join(' ')));
        } catch (ex) {
            repl(mes.channel, mes.author, 'An error occured whilst processing your query', 'bad');
        }
    }

}