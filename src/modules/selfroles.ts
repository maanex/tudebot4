import { TudeBot } from "index";
import { MessageReaction, User } from "discord.js";
const util = require('../util');

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {

    bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
        if (user.bot) return;
        if (!conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`]) return;

        let role = findRole(reaction);
        if (!role) return;

        let extraRoles = conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`].extraRoles || [];

        let member = reaction.message.guild.member(user);
        if (member.roles.find(r => r.id == role.id)) {
            member.removeRole(role);
            const re = reaction;
            const us = user;
            setTimeout(() => re.remove(us), 200);
        } else {
            member.addRole(role);
            for (let rid of extraRoles)
                member.addRole(member.guild.roles.find(r => r.id == rid));
        }
    });

    bot.on('messageReactionRemove', (reaction: MessageReaction, user: User) => {
        if (user.bot) return;
        if (!conf.channels[`${reaction.message.guild.id}/${reaction.message.channel.id}`]) return;

        let role = findRole(reaction);
        if (!role) return;

        let member = reaction.message.guild.member(user);
        if (member.roles.find(r => r.id == role.id))
            member.removeRole(role);
    });

    function findRole(reaction: MessageReaction) {
        let serverdat = data[reaction.message.guild.id];
        if (!serverdat) return null;
        let role = serverdat[reaction.emoji.name];
        if (!role) return null;
        return reaction.message.guild.roles.get(role);
    }

}