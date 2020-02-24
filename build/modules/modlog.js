"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
class ModlogModule extends types_1.Module {
    constructor(conf, data, lang) {
        super('Modlog', 'private', conf, data, lang);
    }
    onEnable() {
        index_1.TudeBot.modlog = {
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
        index_1.TudeBot.on('guildMemberAdd', (mem) => {
            index_1.TudeBot.modlog.log(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
        });
        index_1.TudeBot.on('guildMemberRemove', (mem) => {
            index_1.TudeBot.modlog.log(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = ModlogModule;
//# sourceMappingURL=modlog.js.map