"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    execute(bot, mes, sudo, args, repl) {
        fetch('http://inspirobot.me/api?generate=true')
            .then(o => o.text())
            .then(o => mes.channel.send({
            embed: {
                color: 0x36393f,
                image: {
                    url: o
                },
                footer: {
                    text: `${mes.author.username} • inspirobot.me`,
                    icon_url: mes.author.avatarURL
                }
            }
        }))
            .catch(err => repl(mes.channel, mes.author, 'An error occured!', 'bad'));
    }
};
//# sourceMappingURL=inspiration.js.map