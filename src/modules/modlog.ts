import { modlogType } from '../types';
import { TudeBot } from "index";
import { GuildMember, Guild, TextChannel } from "discord.js";

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    bot.modlog = {
        log: function(guild: Guild, type: modlogType, text: string): void {
            let id: string = guild.id;
            if (!conf.channels[id]) return;
            console.log(conf.channels[id]);
            (guild.channels.get(conf.channels[id]) as TextChannel).send({
                embed: {
                    color: 0x36393f,
                    description: `${data[type]} ${text}`
                }
            });
        }
    }

    bot.on('guildMemberAdd', (mem: GuildMember) => {
        bot.modlog.log(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
    });

    bot.on('guildMemberRemove', (mem: GuildMember) => {
        bot.modlog.log(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
    });

    
}