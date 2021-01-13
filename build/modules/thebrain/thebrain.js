"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nreq = require("request");
const node_wit_1 = require("node-wit");
const types_1 = require("../../types/types");
const index_1 = require("../../index");
/** This is some wild sh*t */
class TheBrainModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('The Brain', 'public', conf, data, guilds, lang);
        this.timeouts = [];
        this.witClient = new node_wit_1.Wit({
            accessToken: index_1.TudeBot.config.thirdparty.wit.token
        });
    }
    onEnable() {
        // TudeBot.on('message', (mes: Message) => {
        //   if (mes.author.bot) return
        // })
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
        const all = this.data.icons.random;
        let i = 0;
        for (const url of all) {
            const request = nreq.defaults({ encoding: null });
            request.get(url, function (err, _res, body) {
                if (err)
                    return;
                if (!body)
                    return;
                const b = body.toString('base64').replace(/^data:image\/png;base64,/, '');
                require('fs').writeFile(`C:\\Users\\andre\\Desktop\\out\\img_${i++}.png`, b, 'base64', function (err) {
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
            sharp(`C:\\Users\\andre\\Desktop\\out\\img_${num}.png`).toFile(`C:\\Users\\andre\\Desktop\\outjpg\\img_${num}.jpg`, (_err, info) => {
                console.log(info);
            });
            num--;
        }
    }
    setNewIcon(timeoutonly = true) {
        if (!timeoutonly) {
            // const request = nreq.defaults({ encoding: null })
            // request.get(this.getIconUrl(), function (err, res, body) {
            //   if (err) return
            //   if (!body) return
            //   // bot.user.setAvatar(body);
            //   // (bot.guilds.get('342620626592464897').channels.get('487263535064154113') as TextChannel).sendFile(body);
            // })
        }
        const sixH = 6 * 60 * 60 * 1000;
        this.timeouts.push(setTimeout(() => this.setNewIcon(false), sixH + Math.floor(Math.random() * sixH * 5)));
    }
    setPlaytext() {
        index_1.TudeBot.user.setActivity(this.getText());
        this.timeouts.push(setTimeout(() => this.setPlaytext(), 1 * 60 * 1000 + Math.floor(Math.random() * 3 * 60 * 60 * 1000)));
    }
    getText() {
        const all = this.data.texts;
        let category = 'info';
        if (Math.random() < 0.5)
            category = 'stuff';
        if (Math.random() < 0.7)
            category = 'random';
        const list = all[category];
        const text = list[Math.floor(Math.random() * list.length)];
        return text;
    }
    getIconUrl() {
        const all = this.data.icons;
        let category = 'random';
        if (Math.random() < 0.7)
            category = 'random';
        const list = all[category];
        const icon = list[Math.floor(Math.random() * list.length)];
        return icon;
    }
}
exports.default = TheBrainModule;
//# sourceMappingURL=thebrain.js.map