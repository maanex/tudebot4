"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
const support_1 = require("../commands/support");
class AutoSupportModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Auto Support', 'public', conf, data, guilds, lang);
        this.cooldown = [];
    }
    onEnable() {
        this.witClient = index_1.TudeBot.getModule('thebrain').witClient;
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (!this.guildData(mes.guild).channels[mes.channel.id])
                return;
            if (mes.content.length > 280)
                return; // Api cannot process text longer than that
            this.witClient.message(mes.content)
                .then((data) => {
                if (!data.entities.intent)
                    return;
                if (data.entities.intent[0].value != 'support')
                    return;
                if (!data.entities.issue)
                    return;
                if (!data.entities.target || data.entities.target[0].suggested || data.entities.target[0].value == 'bot')
                    data.entities.target = [{ value: this.guildData(mes.guild).channels[mes.channel.id] }];
                if (data.entities.target[0].value.includes('free')) {
                    if (support_1.default.RESOUCES.freestuff[data.entities.issue[0].value]) {
                        if (this.cooldown.includes(data.entities.issue[0].value))
                            return;
                        support_1.default.sendSupportEmbed(support_1.default.RESOUCES.freestuff[data.entities.issue[0].value], mes.channel, mes.author);
                        this.cooldown.push(data.entities.issue[0].value);
                        setTimeout(() => this.cooldown.splice(this.cooldown.indexOf(data.entities.issue[0].value), 1), 1000 * 60 * 5);
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
exports.default = AutoSupportModule;
//# sourceMappingURL=autosupport.js.map