import { TudeBot } from 'index';
import { Message, MessageReaction, User as DiscordUser, Guild, VoiceChannel, GuildMember } from 'discord.js';
import * as cron from 'cron';
import TudeApi, { User, ClubUser } from '../thirdparty/tudeapi/tudeapi';

const max_regenValue = 20;
const max_totalValue = 30;

let pointBags: {[id: string]: number} = { };
let messagesSentLast5Sec: {[id: string]: number} = { };
let reactionsAddedLast5Sec: {[id: string]: number} = { };

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    bot.on('message', mes => {
        if (mes.author.bot) return;
        if (!mes.guild) return;
        if (!conf.guilds.includes(mes.guild.id)) return;
        
        let messcont = mes.content;
        // // NOTHING WRONG WITH THIS CODE, JUST DISABLED, PERFORMANCE WISE - NOTHING WRONG WITH PERFORMANCE EITHER, MORE LIKE... A BIT OVERKILL AT THIS POINT, HUH?
        // let letters = [];
        // for (let letter of messcont.split(''))
        //     if (letters.indexOf(letter) < 0) letters.push(letter);
        // for (let letter of letters)
        //     messcont = messcont.split(new RegExp(letter + '+')).join(letter);

        let quality = 1;
        let messageLengthFactor = x => Math.max((-1/x) * (x-40) * (x-40) / 1000 + .5, 0);
        let messagesLast5SecFactor = 1 / (messagesSentLast5Sec[mes.author.id] || 1);
        quality *= messageLengthFactor((messcont.length * 2 + mes.content.length) / 3);
        quality *= messagesLast5SecFactor;

        TudeApi.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageSent', quality * 2)).catch(ex => {});

        if (messagesSentLast5Sec[mes.author.id])
            messagesSentLast5Sec[mes.author.id]++;
        else messagesSentLast5Sec[mes.author.id] = 1;
        setTimeout(() => {
            if (--messagesSentLast5Sec[mes.author.id] <= 0)
            delete messagesSentLast5Sec[mes.author.id];
        }, 5_000);
        if (messagesSentLast5Sec[mes.author.id] > 4) punish(mes.author, 'MessageSpam');

        // Reward previous message
        if (mes.channel.lastMessage.author.id == mes.author.id) return;
        if (mes.channel.lastMessage.createdTimestamp - Date.now() < 1000 * 10) return;
        if (messagesSentLast5Sec[mes.author.id] > 1) return;
        TudeApi.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageEngagement', .5)).catch(ex => {});
    });
    
    bot.on('messageDelete', mes => {
        if (mes.author.bot) return;
        if (!mes.guild) return;
        if (!conf.guilds.includes(mes.guild.id)) return;

        if (reactionsAddedLast5Sec[mes.author.id] > 6) punish(mes.author, 'MessageDelete');
    });
    
    bot.on('messageReactionAdd', (reaction: MessageReaction, user: DiscordUser) => {
        let mes = reaction.message;
        if (user.bot) return;
        if (!mes.guild) return;
        if (!conf.guilds.includes(mes.guild.id)) return;

        let quality = 1;
        if (reaction.count == 1) quality = 1.2;
        quality /= (reactionsAddedLast5Sec[mes.author.id] || 1);
        TudeApi.clubUserByDiscordId(user.id).then(u => reward(u, 'MessageReaction', quality)).catch(ex => {});
        
        if (reactionsAddedLast5Sec[mes.author.id])
            reactionsAddedLast5Sec[mes.author.id]++;
        else reactionsAddedLast5Sec[mes.author.id] = 1;
        setTimeout(() => {
            if (--reactionsAddedLast5Sec[mes.author.id] <= 0)
            delete reactionsAddedLast5Sec[mes.author.id];
        }, 5_000);
        if (reactionsAddedLast5Sec[mes.author.id] > 6) punish(user, 'ReactionSpam');

        // if message author real user and message sent in last hour, reward them too
        if (mes.author.bot) return;
        if (mes.createdTimestamp - Date.now() > 1000 * 60 * 60) return;
        TudeApi.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageEngagement')).catch(ex => {});
    });
    
    bot.on('messageReactionRemove', (reaction: MessageReaction, user: DiscordUser) => {
        let mes = reaction.message;
        if (user.bot) return;
        if (!mes.guild) return;
        if (!conf.guilds.includes(mes.guild.id)) return;

        TudeApi.clubUserByDiscordId(user.id).then(u => punish(user, 'ReactionRemove')).catch(ex => {});
    });

    //       ms s m h d m dw
    cron.job('* 0 * * * * *', regenBags).start();
    cron.job('* 0 0 * * * *', fillBags).start();
    cron.job('* 0 0 * * * *', () => checkVoice(conf.guilds.map(bot.guilds.get))).start();
}

export type RewardReason = 'MessageSent' | 'MessageReaction' | 'MessageEngagement';
export type PunishmentReason = 'MessageDelete' | 'MessageSpam' | 'ReactionRemove' | 'ReactionSpam';

export function reward(user: User | ClubUser, reason: RewardReason, quality: number = 1) {
    let bag = pointBags[user.id];
    if (!bag) bag = (pointBags[user.id] = max_totalValue);
    if (bag <= 0) return;

    let percentage: number = { 'MessageSent': .5, 'MessageReaction': .2, 'MessageEngagement': .1 }[reason];
    percentage *= quality;

    let points = bag * percentage;
    points = Math.floor(points);
    pointBags[user.id] -= points;

    let fun = (u: ClubUser) => {
        u.points += points;
        TudeApi.updateClubUser(u);
    }

    if (user['points']) fun(user as ClubUser); // if user is clubuser, or else:
    else TudeApi.clubUserById(user.id).then(fun).catch();
}

export function punish(user: DiscordUser, punishment: PunishmentReason) {
    let bag = pointBags[user.id];
    if (!bag) bag = (pointBags[user.id] = max_totalValue);

    switch (punishment) {
        case 'MessageDelete':
            if (pointBags[user.id] >= -10)
                pointBags[user.id] -= 10;
            break;
        case 'MessageSpam':
            if (pointBags[user.id] >= -100)
                pointBags[user.id] -= 3;
            break;
        case 'ReactionRemove':
            pointBags[user.id] *= .5;
            break;
        case 'ReactionSpam':
            if (pointBags[user.id] >= -10)
                pointBags[user.id] -= 1;
            break;
    }
}

function regenBags() {
    for (let user in pointBags) {
        if (pointBags[user] >= max_regenValue) continue;
        pointBags[user] += Math.floor(Math.random() * 3) + 3;
    }
}

function fillBags() {
    for (let user in pointBags) {
        if (pointBags[user] < max_regenValue) continue;
        pointBags[user]++;
        if (pointBags[user] >= max_totalValue)
            delete pointBags[user];
    }
}

function checkVoice(guilds: Guild[]) {
    for (let guild of guilds) {
        guild.channels.filter(c => c.type == 'voice').forEach(c => {
            let mems: GuildMember[] = [];
            for (let u of (c as VoiceChannel).members.array())
                if (!u.mute && !u.deaf) mems.push(u);
            if (mems.length > 1) {
                for (let m of mems)
                    TudeApi.clubUserByDiscordId(m.id).then(u => {
                        u.points++;
                        TudeApi.updateClubUser(u);
                    }).catch(ex => {});
            }
        });
    }
}