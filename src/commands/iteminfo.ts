import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');


module.exports = {

    name: 'iteminfo',
    aliases: [
    ],
    desc: 'Iteminfo',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): boolean {
        let item;
        if (!args[0]) item = 'No id specified';
        else item = TudeApi.items.find(i => i.id.toLowerCase() == args[0].toLowerCase() || i.name.toLowerCase() == args[0].toLowerCase());
        repl(mes.channel, mes.author, '```json\n' + JSON.stringify(item, null, 2) + '```');
        return !!item;
    }

}