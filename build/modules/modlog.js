"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class ModlogModule extends types_1.Module {
    constructor(bot, conf, data, lang) {
        super('Modlog', 'private', bot, conf, data, lang);
    }
    onEnable() {
        this.bot.modlog = {
            log: function (guild, type, text) {
                let id = guild.id;
                if (!this.conf.channels[id])
                    return;
                guild.channels.get(this.conf.channels[id]).send({
                    embed: {
                        color: 0x2f3136,
                        description: `${this.data[type]} ${text}`
                    }
                });
            }
        };
        this.bot.on('guildMemberAdd', (mem) => {
            this.bot.modlog.log(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
        });
        this.bot.on('guildMemberRemove', (mem) => {
            this.bot.modlog.log(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = ModlogModule;
//# sourceMappingURL=modlog.js.map