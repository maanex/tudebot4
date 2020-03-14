"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
class HappyBirthdayModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Happy Birthday', 'private', conf, data, guilds, lang);
        this.lastDay = '';
    }
    onEnable() {
    }
    onBotReady() {
        this.interval = setInterval(() => this.check(), 1000 * 60 * 60);
        this.check();
    }
    onDisable() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    check() {
        let date = new Date();
        let dstr = date.getDate() + '-' + (date.getMonth() + 1);
        if (this.lastDay == dstr)
            return;
        this.lastDay = dstr;
        let maxdelay = 1000 * 60 * 60 * 5; // 5h
        setTimeout((daystr, guilds, data) => {
            let users = [];
            for (let user in data) {
                if (data[user] == daystr)
                    users.push(user);
            }
            if (!users.length)
                return;
            let msg = this.lang(users.length > 1 ? 'birthday_message_mult' : 'birthday_message');
            let usrstr = users.map(u => `<@${u}>`).join(' & ');
            msg = msg.split('{}').join(usrstr);
            for (let g of guilds.keys()) {
                let guild = index_1.TudeBot.guilds.get(g);
                if (!guild)
                    continue;
                let channel = guild.channels.get(guilds.get(g).channel);
                if (!channel || channel.type !== 'text')
                    continue;
                channel.send(`@everyone ${msg}`);
            }
        }, Math.floor(Math.random() * maxdelay * 0), dstr, this.guilds, this.data);
    }
}
exports.default = HappyBirthdayModule;
//# sourceMappingURL=happybirthday.js.map