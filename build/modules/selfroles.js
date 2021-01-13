"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types/types");
class SelfrolesModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Selfroles', 'public', conf, data, guilds, lang);
    }
    onEnable() {
        index_1.TudeBot.on('messageReactionAdd', (reaction, user) => {
            if (user.bot)
                return;
            if (!reaction.message.guild)
                return;
            if (!this.isEnabledInGuild(reaction.message.guild))
                return;
            if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id))
                return;
            const role = this.findRole(reaction);
            if (!role)
                return;
            const extraRoles = this.guildData(reaction.message.guild).extraRoles || [];
            const member = reaction.message.guild.member(user);
            if (!member.roles.resolve(role.id)) {
                member.roles.add(role);
                for (const rid of extraRoles)
                    member.roles.add(member.guild.roles.resolve(rid));
            }
        });
        index_1.TudeBot.on('messageReactionRemove', (reaction, user) => {
            if (user.bot)
                return;
            if (!reaction.message.guild)
                return;
            if (!this.isEnabledInGuild(reaction.message.guild))
                return;
            if (!this.guildData(reaction.message.guild).channels.includes(reaction.message.channel.id))
                return;
            const role = this.findRole(reaction);
            if (!role)
                return;
            const member = reaction.message.guild.member(user);
            if (member.roles.resolve(role.id))
                member.roles.remove(role);
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    findRole(reaction) {
        const serverdat = this.guildData(reaction.message.guild);
        if (!serverdat)
            return null;
        const role = serverdat.roles[reaction.emoji.name];
        if (!role)
            return null;
        return reaction.message.guild.roles.resolve(role);
    }
}
exports.default = SelfrolesModule;
//# sourceMappingURL=selfroles.js.map