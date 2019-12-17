"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
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
};
module.exports = {
    name: 'profile',
    aliases: [
        'p'
    ],
    desc: 'See your profile (or someone elses)',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();
        tudeapi_1.default.clubUserByDiscordId(user.id, user)
            .then(u => {
            if (!u || u.error) {
                repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                return;
            }
            let footer = `${u.points}pt`;
            let icon = undefined;
            let xpbar = '';
            let stats = `${_bigspace}\n:cookie: ${u.cookies} ${_bigspace} :gem: ${u.gems}`;
            let prog13 = Math.floor(u.level_progress * 13);
            if (prog13 == 0)
                xpbar += _xpbar.left_empty;
            else if (prog13 == 1)
                xpbar += _xpbar.left_half;
            else
                xpbar += _xpbar.left_full;
            for (let i = 1; i <= 4; i++) {
                let relative = prog13 - i * 2;
                if (relative < 0)
                    xpbar += _xpbar.middle_empty;
                else if (relative == 0)
                    xpbar += _xpbar.middle_1;
                else if (relative == 1)
                    xpbar += _xpbar.middle_2;
                else
                    xpbar += _xpbar.middle_3;
            }
            if (prog13 >= 11)
                xpbar += _xpbar.right_full;
            else if (prog13 == 10)
                xpbar += _xpbar.right_half;
            else
                xpbar += _xpbar.right_empty;
            xpbar += ` **${Math.floor(u.level_progress * 100)}%**`;
            if (u.profile && u.profile.disp_badge) {
                let badge = tudeapi_1.default.badgeById(u.profile.disp_badge);
                let appearance = badge.appearance[0];
                for (let a of badge.appearance) {
                    if (a.from <= u.badges[u.profile.disp_badge])
                        appearance = a;
                    else
                        break;
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
        })
            .catch(err => {
            repl(mes.channel, mes.author, 'An error occured!', 'bad');
            console.error(err);
        });
    }
};
//# sourceMappingURL=profile.js.map