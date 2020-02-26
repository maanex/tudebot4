"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class FreestuffCommand extends types_1.Command {
    constructor(lang) {
        super('freestuff', [], 'Free stuff announcement tool', 0, false, true, lang);
        this.announce = (guild, text) => {
            // let role = guild.roles.get(roleid);
            // role.setMentionable(true).then(() =>
            //     webhook.send(`<@&${roleid}> ${text}`).then(m => {
            //         role.setMentionable(false);
            //         // @ts-ignore
            //         let mes: Message = guild.channels.get(m.channel_id).messages.get(m.id);
            //         mes.react('🆓');
            //     })
            // );
        };
    }
    execute(channel, user, args, event, repl) {
        const perms = event.message.member.hasPermission('MANAGE_CHANNELS') || !!event.message.member.roles.find(r => r.name.split(' ').join('').toLowerCase() == 'freestuff');
        if (!perms) {
            repl(':x: Not allowed!');
            return false;
        }
        if (!args.length) {
            repl('freestuff <link>', 'bad');
            return false;
        }
        repl('Deprecated.', 'bad');
        // this.announce(channel.guild, args.join(' '));
        event.message.delete();
        return true;
    }
}
exports.default = FreestuffCommand;
//# sourceMappingURL=freestuff.js.map