import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";


module.exports = {

    name: 'eval',
    aliases: [ ],
    desc: 'Eval',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, desc?: string) => void): boolean {
        if (mes.author.id !== '137258778092503042') return false;

        try {
            let tapi = TudeApi;
            TudeApi.clubUserByDiscordId(mes.author.id).then(self => {
                repl(mes.channel, mes.author, eval(args.join(' ')));
            }).catch(ex => {
                repl(mes.channel, mes.author, eval(args.join(' ')));
            });        
            return true;
        } catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'message', '```' + ex + '```');
            return false;
        }
    }

}