"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("cron");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const max_regenValue = 20;
const max_totalValue = 30;
let pointBags = {};
let messagesSentLast5Sec = {};
let reactionsAddedLast5Sec = {};
let cronjobs = [];
module.exports = (bot, conf, data, lang) => {
    bot.on('message', mes => {
        if (mes.author.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.guilds.includes(mes.guild.id))
            return;
        let messcont = mes.content;
        // // NOTHING WRONG WITH THIS CODE, JUST DISABLED, PERFORMANCE WISE - NOTHING WRONG WITH PERFORMANCE EITHER, MORE LIKE... A BIT OVERKILL AT THIS POINT, HUH?
        // let letters = [];
        // for (let letter of messcont.split(''))
        //     if (letters.indexOf(letter) < 0) letters.push(letter);
        // for (let letter of letters)
        //     messcont = messcont.split(new RegExp(letter + '+')).join(letter);
        let quality = 1;
        let messageLengthFactor = x => Math.max((-1 / x) * (x - 40) * (x - 40) / 1000 + .5, 0);
        let messagesLast5SecFactor = 1 / (messagesSentLast5Sec[mes.author.id] || 1);
        quality *= messageLengthFactor((messcont.length * 2 + mes.content.length) / 3);
        quality *= messagesLast5SecFactor;
        tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageSent', quality * 2)).catch(ex => { });
        if (messagesSentLast5Sec[mes.author.id])
            messagesSentLast5Sec[mes.author.id]++;
        else
            messagesSentLast5Sec[mes.author.id] = 1;
        setTimeout(() => {
            if (--messagesSentLast5Sec[mes.author.id] <= 0)
                delete messagesSentLast5Sec[mes.author.id];
        }, 5000);
        if (messagesSentLast5Sec[mes.author.id] > 4)
            punish(mes.author, 'MessageSpam');
        // Reward previous message
        if (mes.channel.lastMessage.author.id == mes.author.id)
            return;
        if (mes.channel.lastMessage.createdTimestamp - Date.now() < 1000 * 10)
            return;
        if (messagesSentLast5Sec[mes.author.id] > 1)
            return;
        tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageEngagement', .5)).catch(ex => { });
    });
    bot.on('messageDelete', mes => {
        if (mes.author.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.guilds.includes(mes.guild.id))
            return;
        if (reactionsAddedLast5Sec[mes.author.id] > 6)
            punish(mes.author, 'MessageDelete');
    });
    bot.on('messageReactionAdd', (reaction, user) => {
        let mes = reaction.message;
        if (user.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.guilds.includes(mes.guild.id))
            return;
        let quality = 1;
        if (reaction.count == 1)
            quality = 1.2;
        quality /= (reactionsAddedLast5Sec[mes.author.id] || 1);
        tudeapi_1.default.clubUserByDiscordId(user.id).then(u => reward(u, 'MessageReaction', quality)).catch(ex => { });
        if (reactionsAddedLast5Sec[mes.author.id])
            reactionsAddedLast5Sec[mes.author.id]++;
        else
            reactionsAddedLast5Sec[mes.author.id] = 1;
        setTimeout(() => {
            if (--reactionsAddedLast5Sec[mes.author.id] <= 0)
                delete reactionsAddedLast5Sec[mes.author.id];
        }, 5000);
        if (reactionsAddedLast5Sec[mes.author.id] > 6)
            punish(user, 'ReactionSpam');
        // if message author real user and message sent in last hour, reward them too
        if (mes.author.bot)
            return;
        if (mes.createdTimestamp - Date.now() > 1000 * 60 * 60)
            return;
        tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => reward(u, 'MessageEngagement')).catch(ex => { });
    });
    bot.on('messageReactionRemove', (reaction, user) => {
        let mes = reaction.message;
        if (user.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.guilds.includes(mes.guild.id))
            return;
        tudeapi_1.default.clubUserByDiscordId(user.id).then(u => punish(user, 'ReactionRemove')).catch(ex => { });
    });
    bot.on('guildMemberAdd', member => {
        tudeapi_1.default.clubUserByDiscordId(member.id, member.user)
            .then(u => {
            for (let i = 1; i <= u.level; i++) {
                for (let gid in conf.levelrewards) {
                    let guild = bot.guilds.get(gid);
                    if (!guild)
                        continue;
                    let roleid = conf.levelrewards[gid][i];
                    if (!roleid)
                        continue;
                    member.addRole(guild.roles.find(r => r.id == roleid));
                }
            }
        })
            .catch();
    });
    //                      s m h d m dw
    cronjobs.push(cron.job('0 * * * * *', regenBags));
    cronjobs.push(cron.job('0 0 * * * *', fillBags));
    // cronjobs.push(cron.job('0 0 * * * *', () => checkVoice(conf.guilds.map(bot.guilds.get))).start()); TODO error here
    cronjobs.forEach(j => j.start());
    return {
        onUserLevelup(user, newLevel, rewards) {
            if (!user.user)
                return;
            if (!user.user['accounts'])
                return;
            if (!user.user['accounts']['discord'])
                return;
            let duser = bot.users.get(user.user['accounts']['discord']);
            if (!duser)
                return;
            let desc = `You are now **Level ${newLevel}**\n`;
            if (rewards.cookies)
                desc += `\n+${rewards.cookies} Cookies`;
            if (rewards.gems)
                desc += `\n+${rewards.gems} Gems`;
            if (rewards.keys)
                desc += `\n+${rewards.keys} Keys`;
            duser.send({
                embed: {
                    color: 0x36393f,
                    title: "Ayyy, you've leveled up!",
                    description: desc
                }
            });
            for (let gid in conf.levelrewards) {
                let guild = bot.guilds.get(gid);
                if (!guild)
                    continue;
                let mem = guild.members.get(duser.id);
                if (!mem)
                    continue;
                let roleid = conf.levelrewards[gid][newLevel];
                if (!roleid)
                    continue;
                mem.addRole(guild.roles.find(r => r.id == roleid));
            }
        },
        onDisable() {
            cronjobs.forEach(j => j.stop());
            cronjobs = [];
        }
    };
};
function reward(user, reason, quality = 1) {
    let bag = pointBags[user.id];
    if (!bag)
        bag = (pointBags[user.id] = max_totalValue);
    if (bag <= 0)
        return;
    let percentage = { 'MessageSent': .5, 'MessageReaction': .2, 'MessageEngagement': .1 }[reason];
    percentage *= quality;
    let points = bag * percentage;
    points = Math.floor(points);
    pointBags[user.id] -= points;
    let fun = (u) => {
        u.points += points;
        if (points)
            tudeapi_1.default.updateClubUser(u);
    };
    if (user['points'])
        fun(user); // if user is clubuser, or else:
    else
        tudeapi_1.default.clubUserById(user.id).then(fun).catch();
}
exports.reward = reward;
function punish(user, punishment) {
    let bag = pointBags[user.id];
    if (!bag)
        bag = (pointBags[user.id] = max_totalValue);
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
exports.punish = punish;
function regenBags() {
    for (let user in pointBags) {
        if (pointBags[user] >= max_regenValue)
            continue;
        pointBags[user] += Math.floor(Math.random() * 3) + 3;
    }
}
function fillBags() {
    for (let user in pointBags) {
        if (pointBags[user] < max_regenValue)
            continue;
        pointBags[user]++;
        if (pointBags[user] >= max_totalValue)
            delete pointBags[user];
    }
}
function checkVoice(guilds) {
    for (let guild of guilds) {
        guild.channels.filter(c => c.type == 'voice').forEach(c => {
            let mems = [];
            for (let u of c.members.array())
                if (!u.mute && !u.deaf)
                    mems.push(u);
            if (mems.length > 1) {
                for (let m of mems)
                    tudeapi_1.default.clubUserByDiscordId(m.id).then(u => {
                        u.points++;
                        tudeapi_1.default.updateClubUser(u);
                    }).catch(ex => { });
            }
        });
    }
}
//# sourceMappingURL=getpoints.js.map