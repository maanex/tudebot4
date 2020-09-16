"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emojis_1 = require("../int/emojis");
const types_1 = require("../types/types");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const profileskins_1 = require("../content/profileskins");
class ProfileCommand extends types_1.Command {
    constructor() {
        super({
            name: 'profile',
            aliases: ['p'],
            description: 'See your profile (or someone elses)',
            cooldown: 5,
            groups: ['club'],
        });
    }
    execute(channel, orgUser, args, event, repl) {
        return new Promise((resolve, reject) => {
            let user = orgUser;
            if (event.message.mentions.users.size)
                user = event.message.mentions.users.first();
            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                .then(u => {
                if (!u || u.error) {
                    repl('User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }
                const profileSkin = profileskins_1.ProfileSkin.BLUE;
                const emblemsUsed = emojis_1.default.PROFILE_EMBLEMS[profileSkin.emblemSet];
                let footer = `${u.points}pt`;
                let icon = undefined;
                let xpbar = '';
                let stats = `${emojis_1.default.BIG_SPACE}`;
                let statItems = [`${emblemsUsed.COOKIES} ${u.cookies}`, `${emblemsUsed.GEMS} ${u.gems}`];
                if (u.keys > 0)
                    statItems.push(`${emblemsUsed.KEYS} ${u.keys}`);
                // @ts-ignore
                if (u.inventory.size > 0) {
                    let amount = 0;
                    for (let item of u.inventory.values())
                        amount += item.amount;
                    statItems.push(`${emblemsUsed.ITEMS} ${amount}`);
                }
                if (u.daily.streak >= 7) {
                    statItems.push(`${emblemsUsed.STREAK} ${u.daily.streak}`);
                }
                let c = 0;
                for (let si of statItems)
                    stats += (c++ % 3 == 0 ? '\n\n' : ` ${emojis_1.default.BIG_SPACE} `) + si;
                if (u.daily.claimable && !event.message.mentions.users.size)
                    stats += '\n\n**You haven\'t claimed\nyour daily reward yet!**';
                let prog12 = Math.floor(u.level_progress * 12);
                if (prog12 == 0)
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.LEFT_EMPTY;
                else if (prog12 == 1)
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.LEFT_HALF;
                else
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.LEFT_FULL;
                for (let i = 1; i <= 4; i++) {
                    let relative = prog12 - i * 2;
                    if (relative < 0)
                        xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.MIDDLE_EMPTY;
                    else if (relative == 0)
                        xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.MIDDLE_1;
                    else if (relative == 1)
                        xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.MIDDLE_2;
                    else
                        xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.MIDDLE_3;
                }
                if (prog12 >= 11)
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.RIGHT_FULL;
                else if (prog12 == 10)
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.RIGHT_HALF;
                else
                    xpbar += emojis_1.default.PROFILE_BARS.DEFAULT.RIGHT_EMPTY;
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
                    // icon = 'https://cdn.discordapp.com/attachments/543150321686413313/675367430641680384/guy.png';
                }
                let badges = [];
                if (u.badges) {
                    for (let b of Object.keys(u.badges)) {
                        let badge = tudeapi_1.default.badgeById(parseInt(b));
                        let appearance = badge.getAppearance(u.badges[b]);
                        badges.push(appearance.emoji);
                    }
                }
                let uname = user.username.split('•').join('');
                let uicon = user.avatarURL;
                if (u.user.type == 1) {
                    uname = u.user.name;
                    // uicon = `https://www.gravatar.com/avatar/${md5.hash(u.user.email)}?s=60&d=identicon`;
                    if (u.user.tag == 0) {
                        // uname += ' ✔️';
                        uname += ' •';
                    }
                }
                channel.send({
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
                repl('An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
}
exports.default = ProfileCommand;
//# sourceMappingURL=profile.js.map