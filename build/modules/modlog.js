"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (bot, conf, data) => {
    bot.modlog = {
        log: function (guild, type, text) {
            let id = guild.id;
            if (!conf.channels[id])
                return;
            console.log(conf.channels[id]);
            guild.channels.get(conf.channels[id]).send({
                embed: {
                    color: 0x36393f,
                    description: `${data[type]} ${text}`
                }
            });
        }
    };
    bot.on('guildMemberAdd', (mem) => {
        bot.modlog.log(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
    });
    bot.on('guildMemberRemove', (mem) => {
        bot.modlog.log(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
    });
};
//# sourceMappingURL=modlog.js.map