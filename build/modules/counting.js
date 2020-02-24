"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const util = require("../util/util");
const types_1 = require("../types");
class CountingModule extends types_1.Module {
    constructor(conf, data, lang) {
        super('Counting', 'private', conf, data, lang);
        this.lastUser = '';
        this.lastNum = 0;
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (mes.author.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
                return;
            let content = mes.content.split(' ')[0];
            if (this.lastUser != '' && this.lastUser == mes.author.id) {
                this.react(mes);
                return;
            }
            this.lastUser = mes.author.id;
            let num = parseInt(content);
            if (num == NaN || (this.lastNum != 0 && num - this.lastNum != 1))
                this.react(mes);
            else
                this.lastNum = num;
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    react(mes) {
        this.lastUser = '';
        this.lastNum = 0;
        let emojiName = this.data[mes.guild.id][util.rand(this.data[mes.guild.id].length)];
        let emoji = mes.guild.emojis.find(e => e.name == emojiName);
        mes.react(emoji);
    }
}
exports.default = CountingModule;
//# sourceMappingURL=counting.js.map