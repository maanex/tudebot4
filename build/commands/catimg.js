"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const fetch = require('node-fetch');
class CatCommand extends types_1.Command {
    constructor() {
        super({
            name: 'cat',
            aliases: ['kitten', 'catimage', 'catimg', 'pussy'],
            description: 'A random cat image',
            groups: ['fun', 'images', 'apiwrapper'],
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            fetch('https://api.thecatapi.com/v1/images/search?format=json')
                .then(o => o.json())
                .then(o => channel.send({
                embed: {
                    color: 0x2f3136,
                    image: {
                        url: o[0].url
                    },
                    footer: {
                        text: user.username,
                        icon_url: user.avatarURL
                    }
                }
            }) && resolve(true))
                .catch(err => { repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = CatCommand;
//# sourceMappingURL=catimg.js.map