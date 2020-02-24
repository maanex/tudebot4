"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const fetch = require('node-fetch');
class InspirationCommand extends types_1.Command {
    constructor(lang) {
        super('inspiration', ['inspirational',
            'inspirobot',
            'randomquote',
            'thinkaboutit'], 'Random quote from inspirobot.me', false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            fetch('http://inspirobot.me/api?generate=true')
                .then(o => o.text())
                .then(o => channel.send({
                embed: {
                    color: 0x2f3136,
                    image: {
                        url: o
                    },
                    footer: {
                        text: `${user.username} • inspirobot.me`,
                        icon_url: user.avatarURL
                    }
                }
            }) && resolve(true))
                .catch(err => { repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = InspirationCommand;
//# sourceMappingURL=inspiration.js.map