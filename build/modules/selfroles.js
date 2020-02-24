"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
class SelfrolesModule extends types_1.Module {
    constructor(conf, data, lang) {
        super('Selfroles', 'public', conf, data, lang);
    }
    onEnable() {
        index_1.TudeBot.on('messageReactionAdd', (reaction, user) => {
            if (user.bot)
                return;
            if (!reaction.message.guild)
                return;
            if (!this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`])
                return;
            let role = this.findRole(reaction);
            if (!role)
                return;
            let extraRoles = this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`].extraRoles || [];
            let member = reaction.message.guild.member(user);
            if (member.roles.find(r => r.id == role.id)) {
                member.removeRole(role);
                const re = reaction;
                const us = user;
                setTimeout(() => re.remove(us), 200);
            }
            else {
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
            if (!this.conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`])
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
        let serverdat = this.data[reaction.message.guild.id];
        if (!serverdat)
            return null;
        let role = serverdat[reaction.emoji.name];
        if (!role)
            return null;
        return reaction.message.guild.roles.get(role);
    }
}
exports.default = SelfrolesModule;
//# sourceMappingURL=selfroles.js.map