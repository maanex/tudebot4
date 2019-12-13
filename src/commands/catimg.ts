import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";

const fetch = require('node-fetch');


module.exports = {

    name: 'cat',
    aliases: [
        'kitten',
        'catimage',
        'catimg'
    ],
    desc: 'Random cat image',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void) {
        fetch('https://api.thecatapi.com/v1/images/search?format=json')
            .then(o => o.json())
            .then(o => mes.channel.send({
                embed: {
                    color: 0x36393f,
                    image: {
                        url: o[0].url
                    },
                    footer: {
                        text: mes.author.username,
                        icon_url: mes.author.avatarURL
                    }
                }
            }))
            .catch(err => repl(mes.channel, mes.author, 'An error occured!', 'bad'));
    }

}