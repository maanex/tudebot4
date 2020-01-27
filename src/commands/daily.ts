import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');



module.exports = {

    name: 'daily',
    aliases: [
        'd'
    ],
    desc: 'Get your daily stuff',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        TudeApi.clubUserByDiscordId(mes.author.id, mes.author)
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }

                TudeApi.performClubUserAction(u, { id: 'claim_daily_reward' }).then(o => {
                    let desc = '';
                    let reward = o['reward'];
                    if (reward.points) desc += `**+${reward.points}** point${reward.points == 1 ? '' : 's'}\n`;
                    if (reward.cookies) desc += `**+${reward.cookies}** cookie${reward.cookies == 1 ? '' : 's'} *:cookie:*\n`;
                    if (reward.gems) desc += `**+${reward.gems}** gem${reward.gems == 1 ? '' : 's'} *:gem:*\n`;
                    let streak = o['streak'];
                    if (streak) {
                        let prefix = '';
                        let suffix = '';
                        let bold = streak > 3;
                        if (streak >= 7) suffix = '🔥';
                        if (streak >= 14) prefix = '🔥';
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
                        desc += `\n${prefix} ${bold?'**':''}Streak: ${streak} ${streak == 1 ? 'day' : 'days'}${bold?'**':''} ${suffix}`;
                    }
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
            })
    });
    }

}