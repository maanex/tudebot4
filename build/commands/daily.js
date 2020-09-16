"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
const emojis_1 = require("../int/emojis");
class DailyCommand extends types_1.Command {
    constructor() {
        super({
            name: 'daily',
            aliases: ['d'],
            description: 'Get your daily reward',
            groups: ['club'],
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                .then(u => {
                if (!u || u.error) {
                    repl('Oopsie!', 'bad', 'Please try that again, thank you');
                    resolve(false);
                    return;
                }
                tudeapi_1.default.performClubUserAction(u, { id: 'claim_daily_reward' }).then(o => {
                    let desc = '';
                    let reward = o['reward'];
                    if (reward.points)
                        desc += `**+${reward.points}** point${reward.points == 1 ? '' : 's'} *${emojis_1.default.POINTS}*\n`;
                    if (reward.cookies)
                        desc += `**+${reward.cookies}** cookie${reward.cookies == 1 ? '' : 's'} *${emojis_1.default.COOKIES}*\n`;
                    if (reward.gems)
                        desc += `**+${reward.gems}** gem${reward.gems == 1 ? '' : 's'} *${emojis_1.default.GEMS}*\n`;
                    let streak = o['streak'];
                    if (streak) {
                        let prefix = '';
                        let suffix = '';
                        let bold = streak > 3;
                        if (streak >= 7)
                            suffix = '🔥';
                        if (streak >= 14)
                            prefix = '🔥';
                        if (streak >= 30) {
                            prefix = '🔥🔥';
                            suffix = '🔥🔥';
                        }
                        if (streak >= 60) {
                            prefix = '(╯°□°)╯';
                            suffix = '~(⊙＿⊙\')~';
                        }
                        if (streak == 69) {
                            prefix = '';
                            suffix = '- nice';
                        }
                        if (streak >= 90) {
                            prefix = '🐢';
                            suffix = '🐢';
                        }
                        desc += `\n${prefix} ${bold ? '**' : ''}Streak: ${streak} ${streak == 1 ? 'day' : 'days'}${bold ? '**' : ''} ${suffix}`;
                    }
                    channel.send({
                        embed: {
                            color: 0x2f3136,
                            title: `${event.message.member.displayName}'s daily reward:`,
                            description: desc
                        }
                    });
                    resolve(true);
                }).catch(o => {
                    repl(o.message || 'An error occured!');
                    resolve(false);
                });
            })
                .catch(err => {
                repl('An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
}
exports.default = DailyCommand;
//# sourceMappingURL=daily.js.map