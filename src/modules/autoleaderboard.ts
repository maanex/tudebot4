import { TudeBot } from "index";
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction } from "discord.js";
import TudeApi, { ClubUser } from "../thirdparty/tudeapi/tudeapi";

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {

    const UPDATE_COOLDOWN = 2 * 60_000;
    const UPDATE_EMOJI = '🔄';

    let _channels: TextChannel[] = [];

    function update(channel: TextChannel) {
        generateLeaderboard(channel.guild).then(content => {
            channel.fetchMessages().then(m => {
                if (m.size) {
                    let mes = m.first();
                    mes.edit(content);
                    mes.clearReactions();
                    setTimeout(() => {
                       mes.react(UPDATE_EMOJI);
                    }, UPDATE_COOLDOWN);
                } else {
                    channel.send(content).then(mes => {
                        (mes as Message).react(UPDATE_EMOJI);
                    }).catch(err => {
                        bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
                    });
                }
            }).catch(err => {
                bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
            });
        })
    }

    function generateLeaderboard(guild: Guild): Promise<string> {
        return new Promise((resolve, reject) => {
            TudeApi.clubLeaderboard().then(leaderboard => {
                let out = `   | All Time           | This Month\n---+--------------------+-------------------`;

                let at: ClubUser, tm: ClubUser, ats: string, tms: string, u: GuildMember;
                for (let i = 0; i < 10; i++) {
                    at = leaderboard.alltime[i];
                    u = at ? guild.members.get(at.user['accounts'].discord) : null;
                    if (at) ats = `${u ? u.user.username : at.user.name}..............`.slice(0, 13) + `..lv${at.level}`.slice(-5);
                    else ats = '                  ';

                    tm = leaderboard.month[i];
                    u = tm ? guild.members.get(tm.user['accounts'].discord) : null;
                    if (tm) tms = `${u ? u.user.username : tm.user.name}..............`.slice(0, 13) + `..lv${tm.level}`.slice(-5);
                    else tms = '                  ';

                    out += `\n${((i+1) + '. ').slice(0, 3)}| ${ats} | ${tms}`;
                }
                out += `\nLast Update: ${new Date(leaderboard.updated)}`;
                if (new Date().getHours() == 0) { // Whale fact time
                    out += '``` ```fix\nWhale fact of the day: ';
                    let facts: string[] = data.whalefacts;
                    out += facts[new Date().getDate() % facts.length];
                }
                resolve('```cs\n' + out + '```');
            }).catch(reject);
        });
    }

    bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
        let mes = reaction.message;
        if (user.bot) return;
        if (!mes.guild) return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

        if (reaction.emoji.name == UPDATE_EMOJI)
            update(mes.channel as TextChannel);
    });

    function init(): void {
        for (let path of conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid) return;
            let guild = bot.guilds.get(guildid);
            if (!guild) return;
            let channel = guild.channels.get(channelid);
            if (!channel) return;
            _channels.push(channel as TextChannel);
        }

        let lastmin = 0;
        setInterval(() => {
            let currmin = new Date().getMinutes();
            if (currmin == lastmin) return;
            lastmin = currmin;
            if (currmin != 0) return;
            _channels.forEach(update);
        }, 30_000);
        _channels.forEach(update);
    }
    bot.on('ready', init);

}