"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('../util');
const nreq = require('request');
module.exports = (bot, conf, data, lang) => {
    bot.on('message', (mes) => {
        if (mes.author.bot)
            return;
    });
    bot.on('ready', () => {
        setTimeout(setPlaytext, 1000);
        setTimeout(setNewIcon, 1000);
        // downloadAllImages();
        convertAllImages();
    });
    function downloadAllImages() {
        let all = data.icons.random;
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
    function convertAllImages() {
        let num = 4611;
        const sharp = require('sharp');
        while (num >= 0) {
            sharp(`C:\\Users\\andre\\Desktop\\out\\img_${num}.png`).toFile(`C:\\Users\\andre\\Desktop\\outjpg\\img_${num}.jpg`, (err, info) => {
                console.log(info);
            });
            num--;
        }
    }
    function setNewIcon(timeoutonly = true) {
        if (!timeoutonly) {
            var request = nreq.defaults({ encoding: null });
            request.get(getIconUrl(), function (err, res, body) {
                if (err)
                    return;
                if (!body)
                    return;
                bot.user.setAvatar(body);
                bot.guilds.get('342620626592464897').channels.get('487263535064154113').sendFile(body);
            });
        }
        let sixH = 6 * 60 * 60 * 1000;
        setTimeout(() => setNewIcon(false), sixH + Math.floor(Math.random() * sixH * 5));
    }
    function setPlaytext() {
        bot.user.setActivity(getText());
        setTimeout(setPlaytext, 1 * 60 * 1000 + Math.floor(Math.random() * 60 * 60 * 1000));
    }
    function getText() {
        let all = data.texts;
        let category = 'info';
        if (Math.random() < .5)
            category = 'stuff';
        if (Math.random() < .7)
            category = 'random';
        let list = all[category];
        let text = list[Math.floor(Math.random() * list.length)];
        return text;
    }
    function getIconUrl() {
        let all = data.icons;
        let category = 'random';
        if (Math.random() < .7)
            category = 'random';
        let list = all[category];
        let icon = list[Math.floor(Math.random() * list.length)];
        return icon;
    }
};
//# sourceMappingURL=thebrain.js.map