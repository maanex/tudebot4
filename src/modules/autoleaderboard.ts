import { TudeBot } from "index";
import { Message, TextChannel } from "discord.js";

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {

    let _channels: TextChannel[] = [];

    function update(channel: TextChannel) {
        let content = generateLeaderboard();
        channel.fetchMessages().then(m => {
            m.first().edit(content);
        }).catch(err => {
            bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
        });
    }

    function generateLeaderboard(): string {
        return '';
    }

    function init(): void {
        for (let path of conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid) return;
            console.log(guildid);
            let guild = bot.guilds.get(guildid);
            if (!guild) return;
            let channel = guild.channels.get(channelid);
            if (!channel) return;
            _channels.push(channel as TextChannel);
        }
    }
    init();

}