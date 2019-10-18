import { TudeBot } from "index";
import { GuildMember, Message, Emoji } from "discord.js";
const util = require('../util');

let lastUser: string = '';
let lastNum: number = 0;

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    
    bot.on('message', (mes: Message) => {
        if (mes.author.bot) return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;
        
        let content: string = mes.content.split(' ')[0];

        if (lastUser != '' && lastUser == mes.author.id) {
            react(mes);
            return;
        }
        lastUser = mes.author.id;

        let num: number = parseInt(content);
        if (num == NaN || (lastNum != 0 && num - lastNum != 1)) react(mes);
        else lastNum = num;
    });

    function react(mes: Message) {
        lastUser = '';
        lastNum = 0;
        let emojiName: string = data[mes.guild.id][util.rand(data[mes.guild.id].length)];
        let emoji: Emoji = mes.guild.emojis.find(e => e.name == emojiName);
        mes.react(emoji);
    }

}