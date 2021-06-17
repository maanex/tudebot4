"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types/types");
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
            // this.witClient.message(mes.content.substr(0, 260))
            //   .then((data) => {
            //     console.log(data)
            //     if (!data.intents) return
            //     if (data.intents[0].value !== 'support') return
            //     if (!data.issue) return
            //     if (!data.target || data.target[0].suggested || data.target[0].value === 'bot')
            //       data.target = [ { value: this.guildData(mes.guild).channels[mes.channel.id] } ]
            //     if (data.target[0].value.includes('free')) {
            //       if (SupportCommand.RESOUCES.freestuff[data.issue[0].value]) {
            //         if (this.cooldown.includes(data.issue[0].value)) return
            //         SupportCommand.sendSupportEmbed(SupportCommand.RESOUCES.freestuff[data.issue[0].value], mes.channel as TextChannel, mes.author)
            //         this.cooldown.push(data.issue[0].value)
            //         setTimeout(() => this.cooldown.splice(this.cooldown.indexOf(data.issue[0].value), 1), 1000 * 60 * 5)
            //       }
            //     }
            //   })
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = AutoSupportModule;
//# sourceMappingURL=autosupport.js.map