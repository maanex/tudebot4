import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');


const _bigspace = '<:nothing:409254826938204171>';
const _badge_icons = {
    "1": [
        "<:badge_totm_all:656545161597288458>",
        "<:badge_totm_bronze:656545161307750452>",
        "<:badge_totm_silver:656545161362407433>",
        "<:badge_totm_gold:656545161337372673>",
        "<:badge_totm_plain:656545161177726976>",
        "<:badge_totm_diamond:656545161433579570>",
    ],
    "2": [
        "<:badge_bughunter_finder:656545163270946826>",
        "<:badge_bughunter_finder:656545163270946826>",
        "<:badge_bughunter_smasher:656545163489050625>",
        "<:badge_bughunter_squasher:656545163853955082>",
        "<:badge_bughunter_determinator:656545162281091102>",
        "<:badge_bughunter_killingmonster:656545163736252416>",
    ],
    "3": [
        "<:badge_events_0:656545163933515795>",
        "<:badge_events_1:656545164046893076>",
        "<:badge_events_2:656545164013207572>",
        "<:badge_events_3:656545163472142346>",
        "<:badge_events_4:656545164155813888>",
        "<:badge_events_5:656545163388256308>",
        "<:badge_events_6:656545163824332810>",
        "<:badge_events_7:656545163719737364>",
        "<:badge_events_8:656545163467948102>"
    ],
}

module.exports = {

    name: 'badges',
    aliases: [
        'b'
    ],
    desc: 'See your badges (or someone elses)',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void) {
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();
        TudeApi.clubUserByDiscordId(user.id, user)
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    return;
                }

                let badges = [];
                if (u.badges) {
                    for (let b in u.badges) {
                        let badge = TudeApi.badgeById(parseInt(b));
                        if (!badge) continue;
                        let appearance = badge.appearance[0];
                        let appid = -1;
                        for (let a of badge.appearance) {
                            if (a.from <= u.badges[b])
                                appearance = a;
                            else break;
                            appid++;
                        }
                        badges.push({
                           name: _badge_icons[b][appid] + ' `' + appearance.name + '` (' + badge.keyword + ')',
                           value: badge.description.replace('%s', u.badges[b])
                        });
                    }
                }
                
                let banana = Math.random() < .1;
                mes.channel.send({
                    embed: {
                        author: {
                            name: `${user.username}'s badges:`,
                            icon_url: user.avatarURL
                        },
                        color: 0x36393f,
                        fields: badges,
                        image: { url: (badges.length || !banana) ? '' : 'https://cdn.discordapp.com/attachments/655354019631333397/656567439391326228/banana.png' },
                        footer: { text: (badges.length || banana) ? '' : `${user.username}'s got no badges, pal!` },
                        description: !badges.length && banana ? 'Empathy banana is here for you.' : '',
                    }
                })
            })
            .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
            })
        
    }

}