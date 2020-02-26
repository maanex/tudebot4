"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const fetch = require('node-fetch');
class DogCommand extends types_1.Command {
    constructor(lang) {
        super('dog', ['doggo',
            'dogimage',
            'dogimg'], 'A random dog image', 0, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            fetch('https://api.thedogapi.com/v1/images/search?format=json')
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
exports.default = DogCommand;
//# sourceMappingURL=dogimg.js.map