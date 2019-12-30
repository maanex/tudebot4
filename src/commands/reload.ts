import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";


module.exports = {

    name: 'reload',
    aliases: [ ],
    desc: 'Reload',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, desc?: string) => void): boolean {
        TudeApi.reload();
        mes.react('✅');
        return true;
    }

}