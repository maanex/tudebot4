"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types/types");
class QuotesModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Quotes', 'public', conf, data, guilds, lang);
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            if (!mes.mentions.users.array().length) {
                mes.reply('Bidde `@User [text]` machen. Dange.').then((m) => m.delete({ timeout: 20000 }));
                mes.delete({ timeout: 2000 });
                return;
            }
            const ping = mes.mentions.users.first();
            const cont = mes.content.replace(/<@?!?[0-9]*>/g, '').trim();
            mes.delete();
            mes.channel.send({
                embed: {
                    color: Math.floor(Math.random() * 0xFFFFFF),
                    author: {
                        name: ping.username,
                        icon_url: `https://cdn.discordapp.com/avatars/${ping.id}/${ping.avatar}.jpg`
                    },
                    description: `**${cont}**\n\n__`,
                    footer: {
                        text: mes.author.username,
                        icon_url: `https://cdn.discordapp.com/avatars/${mes.author.id}/${mes.author.avatar}.jpg`
                    }
                }
            });
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = QuotesModule;
//# sourceMappingURL=quotes.js.map