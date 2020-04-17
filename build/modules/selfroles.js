"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
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
            let role = this.findRole(reaction);
            if (!role)
                return;
            let extraRoles = this.guildData(reaction.message.guild).extraRoles || [];
            let member = reaction.message.guild.member(user);
            if (!member.roles.find(r => r.id == role.id)) {
                member.addRole(role);
                for (let rid of extraRoles)
                    member.addRole(member.guild.roles.find(r => r.id == rid));
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
            let role = this.findRole(reaction);
            if (!role)
                return;
            let member = reaction.message.guild.member(user);
            if (member.roles.find(r => r.id == role.id))
                member.removeRole(role);
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    findRole(reaction) {
        let serverdat = this.guildData(reaction.message.guild);
        if (!serverdat)
            return null;
        let role = serverdat.roles[reaction.emoji.name];
        if (!role)
            return null;
        return reaction.message.guild.roles.get(role);
    }
}
exports.default = SelfrolesModule;
//# sourceMappingURL=selfroles.js.map