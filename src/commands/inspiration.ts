import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'inspiration',
    aliases: [
        'inspirational',
        'inspirobot',
        'randomquote',
        'thinkaboutit'
    ],
    desc: 'Random quote from inspirobot.me',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fetch('http://inspirobot.me/api?generate=true')
            .then(o => o.text())
            .then(o => mes.channel.send({
                embed: {
                    color: 0x2f3136,
                    image: {
                        url: o
                    },
                    footer: {
                        text: `${mes.author.username} • inspirobot.me`,
                        icon_url: mes.author.avatarURL
                    }
                }
            }) && resolve(true))
            .catch(err => { repl(mes.channel, mes.author, 'An error occured!', 'bad'); resolve(false) });
    });
    }

}