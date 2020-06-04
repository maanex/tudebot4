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
        const date = new Date();
        const dstr = date.getDate() + '-' + (date.getMonth() + 1);
        if (this.lastDay == dstr)
            return;
        this.lastDay = dstr;
        const maxdelay = 0; //1000 * 60 * 60 * 5; // 5h
        setTimeout((daystr, guilds, data) => {
            for (let g of guilds.keys()) {
                const users = [];
                for (const user in data[g]) {
                    if (data[g][user] == daystr)
                        users.push(user);
                }
                if (!users.length)
                    return;
                const usrstr = users.map(u => `<@${u}>`).join(' & ');
                const msg = this.lang(users.length > 1
                    ? data[g].lang_mult
                    : data[g].lang_one, { user: usrstr });
                const guild = index_1.TudeBot.guilds.get(g);
                if (!guild)
                    continue;
                const channel = guild.channels.get(guilds.get(g).channel);
                if (!channel || channel.type !== 'text')
                    continue;
                channel.send(`@everyone ${msg}`);
            }
        }, Math.floor(Math.random() * maxdelay * 0), dstr, this.guilds, this.data);
    }
}
exports.default = HappyBirthdayModule;
//# sourceMappingURL=happybirthday.js.map