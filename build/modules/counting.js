"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const util = require("../util/util");
const types_1 = require("../types/types");
class CountingModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Counting', 'public', conf, data, guilds, lang);
        this.lastUser = '';
        this.lastNum = 0;
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            const content = mes.content.split(' ')[0];
            if (this.lastUser !== '' && this.lastUser === mes.author.id) {
                this.react(mes);
                return;
            }
            this.lastUser = mes.author.id;
            const num = parseInt(content);
            if (isNaN(num) || (this.lastNum !== 0 && num - this.lastNum !== 1))
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
        const emojiName = this.data[mes.guild.id][util.rand(this.data[mes.guild.id].length)];
        const emoji = mes.guild.emojis.cache.find(e => e.name === emojiName);
        mes.react(emoji.id);
    }
}
exports.default = CountingModule;
//# sourceMappingURL=counting.js.map