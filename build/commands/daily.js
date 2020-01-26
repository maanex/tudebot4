"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const fetch = require('node-fetch');
module.exports = {
    name: 'daily',
    aliases: [
        'd'
    ],
    desc: 'Get your daily stuff',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            tudeapi_1.default.clubUserByDiscordId(mes.author.id, mes.author)
                .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }
                tudeapi_1.default.performClubUserAction(u, { id: 'claim_daily_reward' }).then(o => {
                    let desc = '';
                    let reward = o['reward'];
                    if (reward.points)
                        desc += `**+${reward.points}** point${reward.points == 1 ? '' : 's'}\n`;
                    if (reward.cookies)
                        desc += `**+${reward.cookies}** cookie${reward.cookies == 1 ? '' : 's'} *:cookie:*\n`;
                    if (reward.gems)
                        desc += `**+${reward.gems}** gem${reward.gems == 1 ? '' : 's'} *:gem:*\n`;
                    mes.channel.send({
                        embed: {
                            color: 0x36393f,
                            title: `${mes.member.displayName}'s daily reward:`,
                            description: desc
                        }
                    });
                    resolve(true);
                }).catch(o => {
                    repl(mes.channel, mes.author, o.message || 'An error occured!');
                    resolve(false);
                });
            })
                .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
};
//# sourceMappingURL=daily.js.map