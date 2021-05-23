"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        index_1.TudeBot.modlog = function (guild, type, text, priority) {
            const id = guild.id;
            if (!guilds.has(id))
                return;
            const channelId = guilds.get(id)['channel-' + priority] || guilds.get(id).channel;
            guild.channels.resolve(channelId).send({
                embed: {
                    color: 0x2F3136,
                    description: `${emojis_1.default.MODLOG[type]} ${text}`
                }
            });
        };
        index_1.TudeBot.on('guildMemberAdd', (mem) => {
            index_1.TudeBot.modlog(mem.guild, 'user_join', `${mem.user} as ${mem.user.username}`, 'low');
        });
        index_1.TudeBot.on('guildMemberRemove', (mem) => {
            index_1.TudeBot.modlog(mem.guild, 'user_quit', `${mem.user} as ${mem.user.username}`, 'low');
        });
        index_1.TudeBot.on('guildBanAdd', (guild, user) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const ban = yield guild.fetchBan(user);
                index_1.TudeBot.modlog(guild, 'punish', `${user} as ${user.username} was banned by unknown for reason ${ban.reason}`, 'high');
            }), 1000);
        });
        index_1.TudeBot.on('guildBanRemove', (guild, user) => {
            index_1.TudeBot.modlog(guild, 'punish', `The ban for ${user} as ${user.username} was lifted`, 'high');
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = ModlogModule;
//# sourceMappingURL=modlog.js.map