"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
module.exports = {
    name: 'image',
    aliases: [
        'randomimage',
        'random',
        'rndimg'
    ],
    desc: 'Random image',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            fetch('http://pd.tude.ga/imgdb.json')
                .then(o => o.json())
                .then(o => mes.channel.send({
                embed: {
                    color: 0x2f3136,
                    description: args.length && 'You cannot search for an image. This command shows a random image the bot has found somewhere on the world wide web!',
                    image: {
                        url: o[Math.floor(Math.random() * o.length)]
                    },
                    footer: {
                        text: mes.author.username,
                        icon_url: mes.author.avatarURL
                    }
                }
            }) && resolve(true))
                .catch(err => { repl(mes.channel, mes.author, 'An error occured!', 'bad'); resolve(false); });
        });
    }
};
//# sourceMappingURL=randomimage.js.map