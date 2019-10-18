"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('../util');
module.exports = (bot, conf, data, lang) => {
    bot.on('messageReactionAdd', (reaction, user) => {
        if (user.bot)
            return;
        if (!conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`])
            return;
        let role = findRole(reaction);
        if (!role)
            return;
        let extraRoles = conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`].extraRoles || [];
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
    bot.on('messageReactionRemove', (reaction, user) => {
        if (user.bot)
            return;
        if (!conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`])
            return;
        let role = findRole(reaction);
        if (!role)
            return;
        let member = reaction.message.guild.member(user);
        if (member.roles.find(r => r.id == role.id))
            member.removeRole(role);
    });
    function findRole(reaction) {
        let serverdat = data[reaction.message.guild.id];
        if (!serverdat)
            return null;
        let role = serverdat[reaction.emoji.name];
        if (!role)
            return null;
        return reaction.message.guild.roles.get(role);
    }
};
//# sourceMappingURL=selfroles.js.map