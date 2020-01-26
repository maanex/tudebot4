"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
let interval;
module.exports = (bot, conf, data, lang) => {
    const UPDATE_COOLDOWN = 2 * 60000;
    const UPDATE_EMOJI = '🔄';
    let _channels = [];
    function update(channel) {
        generateLeaderboard(channel.guild).then(content => {
            channel.fetchMessages().then(m => {
                if (m.size) {
                    let mes = m.first();
                    mes.edit(content);
                    mes.clearReactions();
                    setTimeout(() => {
                        mes.react(UPDATE_EMOJI);
                    }, UPDATE_COOLDOWN);
                }
                else {
                    channel.send(content).then(mes => {
                        mes.react(UPDATE_EMOJI);
                    }).catch(err => {
                        bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
                    });
                }
            }).catch(err => {
                bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
            });
        }).catch(err => {
            bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
        });
    }
    function generateLeaderboard(guild) {
        return new Promise((resolve, reject) => {
            tudeapi_1.default.clubLeaderboard().then(leaderboard => {
                let out = `   | All Time           | This Month\n---+--------------------+-------------------`;
                let at, tm, ats, tms, u, pm;
                for (let i = 0; i < 10; i++) {
                    at = leaderboard.alltime[i];
                    u = at ? guild.members.get(at.user['accounts'].discord) : null;
                    if (at)
                        ats = `${u ? u.user.username : at.user.name}..............`.slice(0, 13) + `..lv${at.level}`.slice(-5);
                    else
                        ats = '                  ';
                    tm = leaderboard.month[i];
                    u = tm ? guild.members.get(tm.user['accounts'].discord) : null;
                    if (tm) {
                        if (tm.points_month > 1000) {
                            let smol = Math.floor(tm.points_month / 100);
                            if (smol > 99) {
                                smol = Math.floor(tm.points_month / 10);
                                pm = smol + 'k';
                            }
                            else {
                                pm = `${smol}`.charAt(0) + '.' + `${smol}`.charAt(1) + 'k';
                            }
                        }
                        else
                            pm = tm.points_month + '';
                        tms = `${u ? u.user.username : tm.user.name}..............`.slice(0, 13) + `......${pm}`.slice(-5);
                    }
                    else
                        tms = '                  ';
                    out += `\n${((i + 1) + '. ').slice(0, 3)}| ${ats} | ${tms}`;
                }
                out += `\nLast Update: ${new Date(leaderboard.updated)}`;
                if (new Date().getHours() == 0) { // Whale fact time
                    out += '``` ```fix\nWhale fact of the day: ';
                    let facts = data.whalefacts;
                    out += facts[new Date().getDate() % facts.length];
                }
                resolve('```cs\n' + out + '```');
            }).catch(reject);
        });
    }
    bot.on('messageReactionAdd', (reaction, user) => {
        let mes = reaction.message;
        if (user.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
            return;
        if (reaction.emoji.name == UPDATE_EMOJI)
            update(mes.channel);
    });
    function init() {
        for (let path of conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid)
                return;
            let guild = bot.guilds.get(guildid);
            if (!guild)
                return;
            let channel = guild.channels.get(channelid);
            if (!channel)
                return;
            _channels.push(channel);
        }
        let lastmin = 0;
        interval = setInterval(() => {
            let currmin = new Date().getMinutes();
            if (currmin == lastmin)
                return;
            lastmin = currmin;
            if (currmin != 0)
                return;
            _channels.forEach(update);
        }, 30000);
        _channels.forEach(update);
    }
    bot.on('ready', init);
    return {
        onDisable() {
            clearInterval(interval);
            interval = undefined;
        }
    };
};
//# sourceMappingURL=autoleaderboard.js.map