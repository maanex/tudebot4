"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
const index_1 = require("../index");
const emojis_1 = require("../int/emojis");
class ModlogModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Modlog', 'public', conf, data, guilds, lang);
    }
    onEnable() {
        const guilds = this.guilds;
        index_1.TudeBot.modlog = function (guild, type, text) {
            const id = guild.id;
            if (!guilds.has(id))
                return;
            guild.channels.resolve(guilds.get(id).channel).send({
                embed: {
                    color: 0x2F3136,
                    description: `${emojis_1.default.MODLOG[type]} ${text}`
                }
            });
        };
        index_1.TudeBot.on('guildMemberAdd', (mem) => {
            index_1.TudeBot.modlog(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`);
        });
        index_1.TudeBot.on('guildMemberRemove', (mem) => {
            index_1.TudeBot.modlog(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`);
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = ModlogModule;
//# sourceMappingURL=modlog.js.map