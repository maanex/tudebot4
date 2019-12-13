"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (bot, conf, data, lang) => {
    let _channels = [];
    function update(channel) {
        let content = generateLeaderboard();
        channel.fetchMessages().then(m => {
            m.first().edit(content);
        }).catch(err => {
            bot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
        });
    }
    function generateLeaderboard() {
        return '';
    }
    function init() {
        for (let path of conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid)
                return;
            console.log(guildid);
            let guild = bot.guilds.get(guildid);
            if (!guild)
                return;
            let channel = guild.channels.get(channelid);
            if (!channel)
                return;
            _channels.push(channel);
        }
    }
    init();
};
//# sourceMappingURL=autoleaderboard.js.map