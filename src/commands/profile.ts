import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType, ReplyFunction } from "types";
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

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: ReplyFunction): Promise<boolean> {
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
                if (u.inventory.size > 0) {
                    let amount = 0;
                    for (let item of u.inventory.values())
                        amount += item.amount;
                    statItems.push(`:package: ${amount}`);
                }
                if (u.daily.streak >= 7) {
                    statItems.push(`:flame: ${u.daily.streak}`);
                }
                
                let c = 0;
                for (let si of statItems)
                    stats += (c++ % 3 == 0 ? '\n\n' : ` ${_bigspace} `) + si;

                if (u.daily.claimable && !mes.mentions.users.size)
                    stats += '\n\n**You haven\'t claimed\nyour daily reward yet!**';
                
                let prog12 = Math.floor(u.level_progress * 12);
                if (prog12 == 0) xpbar += _xpbar.left_empty;
                else if (prog12 == 1) xpbar += _xpbar.left_half;
                else xpbar += _xpbar.left_full;
                for (let i = 1; i <= 4; i++) {
                    let relative = prog12 - i * 2;
                    if (relative < 0) xpbar += _xpbar.middle_empty;
                    else if (relative == 0) xpbar += _xpbar.middle_1;
                    else if (relative == 1) xpbar += _xpbar.middle_2;
                    else xpbar += _xpbar.middle_3;
                }
                if (prog12 >= 11) xpbar += _xpbar.right_full;
                else if (prog12 == 10) xpbar += _xpbar.right_half;
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
                    // icon = 'https://cdn.discordapp.com/attachments/543150321686413313/675367430641680384/guy.png';
                }
                let badges: string[] = []
                if (u.badges) {
                    for (let b of Object.keys(u.badges)) {
                        let badge = TudeApi.badgeById(parseInt(b));
                        let appearance = badge.getAppearance(u.badges[b]);
                        badges.push(appearance.emoji);
                    }
                }

                let uname = user.username;
                let uicon = user.avatarURL;
                if (u.user.type == 1) {
                    uname = u.user.name;
                    // uicon = '';
                    if (u.user.tag == 0) {
                        uname += ' ✔️';
                    }
                }

                mes.channel.send({
                    embed: {
                        author: {
                            name: uname,
                            icon_url: uicon
                        },
                        color: 0x2f3136,
                        footer: { text: footer },
                        thumbnail: { url: icon },
                        description: badges.join(' ') + '```fix\nLevel ' + u.level + '```',
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