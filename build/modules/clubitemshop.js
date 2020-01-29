"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const database_1 = require("../database/database");
const _bigspace = '<:nothing:409254826938204171>';
module.exports = (bot, conf, data, lang) => {
    let _channels = [];
    function update(channel, shelfs) {
        channel.fetchMessages().then(mes => {
            if (mes.size) {
                let c = 0;
                for (let m of mes.array()) {
                    if (m.author.id != bot.user.id)
                        continue;
                    if (c == 0) {
                        if (!m.embeds.length)
                            m.edit('​\n\n\n​' /* contains two zero with dividers at start and end of the string */, { embed: {
                                    title: 'Welcome to the shop!',
                                    color: 0x36393f,
                                    description: '*Scroll up to browse the shelfs!*\n> To purchase an item, just type it\'s name into this channel.\n> To buy multiple of a kind, let\'s say 5 fishing lure, just add\n> the amount like so: `lure 5`.',
                                    footer: { text: 'Purchasing an item cannot be undone.' }
                                } });
                    }
                    else if (c < shelfs.length + 1) {
                        let s = shelfs[shelfs.length - c];
                        if (s.changes)
                            m.edit('', { embed: shelfToEmbed(s) });
                    }
                    else {
                        if (m.embeds.length)
                            m.edit(_bigspace, { embed: null });
                    }
                    c++;
                }
            }
            else {
                bot.modlog.log(channel.guild, 'warning', 'Itemshop could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupitemshop ' + channel.id + '`');
            }
        }).catch(err => {
            bot.modlog.log(channel.guild, 'warning', 'Itemshop could not get updated! Error: ```' + err + '```');
        });
    }
    function shelfToEmbed(shelf) {
        return {
            title: shelf.title,
            color: getShelfColor(shelf.category),
            description: shelf.items.map(i => {
                let itemdata = tudeapi_1.default.items.find(item => item.id == i.item);
                if (!itemdata)
                    return 'error, item not found: ' + i.item;
                return `${itemdata.icon} ${itemdata.name}\n${_bigspace} \`${i.item}\` • ${i.discount ? `~~${i.price}~~ **${i.discount}**` : i.price} ${getCurrencyIcon(i.currency)}`;
            }).join('\n\n')
        };
    }
    function getShelfColor(category) {
        switch (category) {
            case 'regular': return 0xD99E82;
            case 'gem': return 0x8CCAF7;
            case 'special': return 0xA6D388;
            case 'event': return 0xFFFFFF; // EVENT-UPDATE
        }
    }
    function getCurrencyIcon(currency) {
        switch (currency) {
            case 'cookies': return '🍪';
            case 'gems': return '💎';
            case 'event-tokens': return '[]'; // EVENT-UPDATE
        }
    }
    function getShopdata() {
        return __awaiter(this, void 0, void 0, function* () {
            let target = (yield database_1.default.collection('clubitemshop').findOne({ _id: 'target' }))['shelfs'];
            let current = (yield database_1.default.collection('clubitemshop').findOne({ _id: 'current' }))['shelfs'];
            target = target.reverse();
            current = current.reverse();
            let out = [];
            for (let i = 0; i < target.length; i++) {
                let s = Object.assign({}, target[i]);
                s.changes = !areShelfsEqual(target[i], current[i]);
                out.push(s);
            }
            database_1.default.collection('clubitemshop').updateOne({ _id: 'current' }, { '$set': { shelfs: target.reverse() } });
            return out.reverse();
        });
    }
    function areShelfsEqual(shelf1, shelf2) {
        if (shelf1 == undefined)
            return shelf2 == undefined;
        if (shelf2 == undefined)
            return false;
        if (shelf1.category != shelf2.category)
            return false;
        if (shelf1.title != shelf2.title)
            return false;
        if (shelf1.items.length != shelf2.items.length)
            return false;
        for (let i = 0; i < shelf1.items.length; i++) {
            if (shelf1.items[i].price != shelf2.items[i].price)
                return false;
            if (shelf1.items[i].item != shelf2.items[i].item)
                return false;
            if (shelf1.items[i].discount != shelf2.items[i].discount)
                return false;
            if (shelf1.items[i].currency != shelf2.items[i].currency)
                return false;
        }
        return true;
    }
    function init() {
        for (let path of conf.channels) {
            let guildid = path.split('/')[0];
            let channelid = path.split('/')[1];
            if (!guildid || !channelid)
                return;
            let guild = bot.guilds.get(guildid);
            if (!guild)
                return;
            let channel = guild.channels.get(channelid);
            if (!channel)
                return;
            _channels.push(channel);
        }
        getShopdata().then(d => {
            _channels.forEach(c => update(c, d));
        }).catch(err => console.error);
    }
    bot.on('ready', init);
    return {
        onDisable() {
        }
    };
};
//# sourceMappingURL=clubitemshop.js.map