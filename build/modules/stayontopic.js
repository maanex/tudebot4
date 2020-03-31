"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
class StayOnTopicModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Stay on topic', 'public', conf, data, guilds, lang);
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            for (let rule of this.guildData(mes.guild).rules) {
                const regex = new RegExp(rule.match, 'i');
                if (regex.test(mes.content)) {
                    if (rule.target == mes.channel.id)
                        continue;
                    const channel = mes.guild.channels.get(rule.target);
                    if (!channel)
                        continue;
                    this.redirectUser(mes.author, mes.channel, channel, rule.name);
                    break;
                }
            }
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    redirectUser(user, from, to, topic) {
        from.send(this.lang('wrong_channel_topic')
            .split('{user}').join(user.toString())
            .split('{topic}').join(topic)
            .split('{channel}').join(to.toString()));
    }
}
exports.default = StayOnTopicModule;
//# sourceMappingURL=stayontopic.js.map