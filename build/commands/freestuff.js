"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const webhook_beta = new discord_js_1.WebhookClient('640662711574855682', 'C_ecNpjhkGWUXHZY19rbCYV0TBh5NiQyXeZ8XJJ7t5T2_mylW4oH0rwMjls2F1KsMI0p');
const webhook = new discord_js_1.WebhookClient('640653556092764161', 'C_ecNpjhkGWUXHZY19rbCYV0TBh5NiQyXeZ8XJJ7t5T2_mylW4oH0rwMjls2F1KsMI0p');
const roleid_beta = '640659864988811275';
const roleid = '534398566576291860';
module.exports = {
    name: 'freestuff',
    aliases: [],
    desc: 'Free stuff announcement tool',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        let perms = mes.member.hasPermission('MANAGE_CHANNELS') || !!mes.member.roles.find(r => r.name.split(' ').join('').toLowerCase() == 'freestuff');
        if (!perms) {
            repl(mes.channel, mes.author, ':x: Not allowed!');
            return;
        }
        if (!args.length) {
            repl(mes.channel, mes.author, 'freestuff <link>', 'bad');
            return;
        }
        let role = mes.guild.roles.get(roleid);
        role.setMentionable(true).then(() => webhook.send(`<@&${roleid}> ${args.join(' ')}`).then(m => {
            role.setMentionable(false);
            m.react('🆓');
        }));
        mes.delete();
    }
};
//# sourceMappingURL=freestuff.js.map