import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');


const _bigspace = '<:nothing:409254826938204171>';
const _xpbar = {
    left_empty: '<:xpbarleftempty:654357985845575716>',
    left_half: '<:xpbarlefthalf:654353598301339668>',
    left_full: '<:xpbarleftfull:654353598603460609>',
    middle_empty: '<:xpbarmiddleempty:654353598087430174>',
    middle_1: '<:xpbarmiddle1:654353598288887840>',
    middle_2: '<:xpbarmiddle2:654353598230167574>',
    middle_3: '<:xpbarmiddle3:654353597819256843>',
    right_empty: '<:xpbarrightempty:654353598263853066>',
    right_half: '<:xpbarrighthalf:654353597999611908>',
    right_full: '<:xpbarrightfull:654353598204870656>'
}

module.exports = {

    name: 'profile',
    aliases: [
        'p'
    ],
    desc: 'See your profile (or someone elses)',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();
        TudeApi.clubUserByDiscordId(user.id, user)
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }

                let footer = `${u.points}pt`;
                let icon = undefined;
                let xpbar ='';
                let stats = `${_bigspace}`;
                let statItems = [ `:cookie: ${u.cookies}`, `:gem: ${u.gems}` ];
                if (u.keys > 0) statItems.push(`:key: ${u.keys}`);
                // @ts-ignore
                if (u.inventory.length > 0) statItems.push(`:package: ${u.inventory.count(i => i.amount)}`);
                
                let c = 0;
                for (let si of statItems)
                    stats += (c++ % 3 == 0 ? '\n\n' : ` ${_bigspace} `) + si;
                
                let prog13 = Math.floor(u.level_progress * 13);
                if (prog13 == 0) xpbar += _xpbar.left_empty;
                else if (prog13 == 1) xpbar += _xpbar.left_half;
                else xpbar += _xpbar.left_full;
                for (let i = 1; i <= 4; i++) {
                    let relative = prog13 - i * 2;
                    if (relative < 0) xpbar += _xpbar.middle_empty;
                    else if (relative == 0) xpbar += _xpbar.middle_1;
                    else if (relative == 1) xpbar += _xpbar.middle_2;
                    else xpbar += _xpbar.middle_3;
                }
                if (prog13 >= 11) xpbar += _xpbar.right_full;
                else if (prog13 == 10) xpbar += _xpbar.right_half;
                else xpbar += _xpbar.right_empty;

                xpbar += ` **${Math.floor(u.level_progress * 100)}%**`;

                if (u.profile && u.profile.disp_badge) {
                    let badge = TudeApi.badgeById(u.profile.disp_badge);
                    let appearance = badge.appearance[0];
                    for (let a of badge.appearance) {
                        if (a.from <= u.badges[u.profile.disp_badge])
                            appearance = a;
                        else break;
                    }
                    footer += ' • ' + appearance.name;
                    icon = appearance.icon;
                }

                mes.channel.send({
                    embed: {
                        author: {
                            name: user.username,
                            icon_url: user.avatarURL
                        },
                        color: 0x36393f,
                        footer: { text: footer },
                        thumbnail: { url: icon },
                        description: '```fix\nLevel ' + u.level + '```',
                        fields: [
                            {
                                name: xpbar,
                                value: stats
                            }
                        ]
                    }
                });
                resolve(true);
            })
            .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
                resolve(false);
            })
    });
    }

}