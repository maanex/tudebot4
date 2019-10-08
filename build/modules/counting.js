"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('../util');
let lastUser = '';
let lastNum = 0;
module.exports = (bot, conf, data) => {
    bot.on('message', (mes) => {
        if (mes.author.bot)
            return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
            return;
        let content = mes.content.split(' ')[0];
        if (lastUser != '' && lastUser == mes.author.id) {
            react(mes);
            return;
        }
        lastUser = mes.author.id;
        let num = parseInt(content);
        if (num == NaN || (lastNum != 0 && num - lastNum != 1))
            react(mes);
        else
            lastNum = num;
    });
    function react(mes) {
        lastUser = '';
        lastNum = 0;
        let emojiName = data[mes.guild.id][util.rand(data[mes.guild.id].length)];
        let emoji = mes.guild.emojis.find(e => e.name == emojiName);
        mes.react(emoji);
    }
};
//# sourceMappingURL=counting.js.map