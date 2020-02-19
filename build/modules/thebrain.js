"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nreq = require("request");
const types_1 = require("../types");
class TheBrainModule extends types_1.Module {
    constructor(bot, conf, data, lang) {
        super('The Brain', 'private', bot, conf, data, lang);
        this.timeouts = [];
    }
    onEnable() {
        this.bot.on('message', (mes) => {
            if (mes.author.bot)
                return;
        });
    }
    onBotReady() {
        setTimeout(() => this.setPlaytext(), 1000);
        setTimeout(() => this.setNewIcon(), 1000);
    }
    onDisable() {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
    }
    downloadAllImages() {
        let all = this.data.icons.random;
        let i = 0;
        for (let url of all) {
            var request = nreq.defaults({ encoding: null });
            request.get(url, function (err, res, body) {
                if (err)
                    return;
                if (!body)
                    return;
                let b = body.toString('base64').replace(/^data:image\/png;base64,/, "");
                require("fs").writeFile(`C:\\Users\\andre\\Desktop\\out\\img_${i++}.png`, b, 'base64', function (err) {
                    console.log(err);
                });
                console.log(`Image ${i} exportiert`);
            });
        }
    }
    convertAllImages() {
        let num = 4611;
        const sharp = require('sharp');
        while (num >= 0) {
            sharp(`C:\\Users\\andre\\Desktop\\out\\img_${num}.png`).toFile(`C:\\Users\\andre\\Desktop\\outjpg\\img_${num}.jpg`, (err, info) => {
                console.log(info);
            });
            num--;
        }
    }
    setNewIcon(timeoutonly = true) {
        if (!timeoutonly) {
            var request = nreq.defaults({ encoding: null });
            request.get(this.getIconUrl(), function (err, res, body) {
                if (err)
                    return;
                if (!body)
                    return;
                // bot.user.setAvatar(body);
                // (bot.guilds.get('342620626592464897').channels.get('487263535064154113') as TextChannel).sendFile(body);
            });
        }
        let sixH = 6 * 60 * 60 * 1000;
        this.timeouts.push(setTimeout(() => this.setNewIcon(false), sixH + Math.floor(Math.random() * sixH * 5)));
    }
    setPlaytext() {
        this.bot.user.setActivity(this.getText());
        this.timeouts.push(setTimeout(this.setPlaytext, 1 * 60 * 1000 + Math.floor(Math.random() * 3 * 60 * 60 * 1000)));
    }
    getText() {
        let all = this.data.texts;
        let category = 'info';
        if (Math.random() < .5)
            category = 'stuff';
        if (Math.random() < .7)
            category = 'random';
        let list = all[category];
        let text = list[Math.floor(Math.random() * list.length)];
        return text;
    }
    getIconUrl() {
        let all = this.data.icons;
        let category = 'random';
        if (Math.random() < .7)
            category = 'random';
        let list = all[category];
        let icon = list[Math.floor(Math.random() * list.length)];
        return icon;
    }
}
exports.default = TheBrainModule;
//# sourceMappingURL=thebrain.js.map