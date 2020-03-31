"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
const support_1 = require("../commands/support");
class AutoSupportModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Auto Support', 'public', conf, data, guilds, lang);
    }
    onEnable() {
        this.witClient = index_1.TudeBot.getModule('thebrain').witClient;
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (!this.guildData(mes.guild).channels[mes.channel.id])
                return;
            this.witClient.message(mes.content)
                .then((data) => {
                if (!data.entities.intent)
                    return;
                if (data.entities.intent[0].value != 'support')
                    return;
                if (!data.entities.issue)
                    return;
                if (!data.entities.target || data.entities.target[0].suggested)
                    data.entities.target = [{ value: this.guildData(mes.guild).channels[mes.channel.id] }];
                if (data.entities.target[0].value.includes('free')) {
                    if (support_1.default.RESOUCES.freestuff[data.entities.issue[0].value]) {
                        support_1.default.sendSupportEmbed(support_1.default.RESOUCES.freestuff[data.entities.issue[0].value], mes.channel, mes.author);
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