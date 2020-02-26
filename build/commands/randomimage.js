"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const fetch = require('node-fetch');
class RandomImageCommand extends types_1.Command {
    constructor(lang) {
        super('image', ['randomimage',
            'random',
            'rndimg'], 'A completely random image', 0, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            fetch('http://pd.tude.ga/imgdb.json')
                .then(o => o.json())
                .then(o => channel.send({
                embed: {
                    color: 0x2f3136,
                    description: args.length ? 'You cannot search for an image. This command shows a random image the bot has found somewhere on the world wide web!' : '',
                    image: {
                        url: o[Math.floor(Math.random() * o.length)]
                    },
                    footer: {
                        text: user.username,
                        icon_url: user.avatarURL
                    }
                }
            }) && resolve(true))
                .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = RandomImageCommand;
//# sourceMappingURL=randomimage.js.map