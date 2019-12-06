import { TudeBot } from "index";
import { Message } from "discord.js";

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    bot.on('message', mes => {
        if (mes.author.bot) return;
        if (!mes.guild) return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;
        if (!mes.mentions.users.array().length) {
            mes.reply('Bidde `@User [text]` machen. Dange.').then((m: Message) => m.delete(20000));
            mes.delete(2000);
            return;
        }
        let ping = mes.mentions.users.first();
        let cont = mes.content.replace(/<@?!?[0-9]*>/g, '').trim();
        console.log(`https://cdn.discordapp.com/avatars/${ping.id}/${ping.avatar}.jpg`);
        mes.delete();
        mes.channel.send({
            embed: {
                color: Math.floor(Math.random() * 0xffffff),
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