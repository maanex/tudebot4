import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');


module.exports = {

    name: 'uinfo',
    aliases: [
    ],
    desc: 'Userinfo',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();
        TudeApi.clubUserByDiscordId(user.id/*, mes.author*/) // Don't create a new profile on loopup
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }

                repl(mes.channel, mes.author, '```json\n' + JSON.stringify(u, null, 2) + '```');
                resolve(true);
            })
            .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
                resolve(false);
            })
    });
    }

}