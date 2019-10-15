"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'dog',
    aliases: [
        'doggo'
    ],
    desc: 'Random dog image',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        fetch('https://api.thedogapi.com/v1/images/search?format=json')
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
};
//# sourceMappingURL=dogimg.js.map