"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const fetch = require('node-fetch');
module.exports = {
    name: 'uinfo',
    aliases: [],
    desc: 'Userinfo',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            let user = mes.author;
            if (mes.mentions.users.size)
                user = mes.mentions.users.first();
            tudeapi_1.default.clubUserByDiscordId(user.id /*, mes.author*/) // Don't create a new profile on loopup
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
            });
        });
    }
};
//# sourceMappingURL=uinfo.js.map