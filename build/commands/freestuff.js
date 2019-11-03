"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const webhook = new discord_js_1.WebhookClient('640662711574855682', 'arJl-LoOQqfPNOs3MxqTzt9eybiLiMxtRamR99SGm3GFR1T6J-aRMKaFe1Ba3RO2qTdh');
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
        webhook.send(args.join(' '));
    }
};
//# sourceMappingURL=freestuff.js.map