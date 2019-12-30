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
const discord_js_1 = require("discord.js");
const tudeapi_1 = require("./thirdparty/tudeapi/tudeapi");
const wcp_1 = require("./thirdparty/wcp/wcp");
const database_1 = require("./database/database");
const mongo_adapter_1 = require("./database/mongo.adapter");
const chalk = require('chalk');
const settings = require('../config/settings.json');
class TudeBot extends discord_js_1.Client {
    constructor(props) {
        super(props);
        this.m = {};
        this.modules = [
            'modlog',
            'quotes',
            'counting',
            'selfroles',
            'commands',
            'happybirthday',
            'thebrain',
            'memes',
            'autoleaderboard',
            'getpoints',
        ];
        fixReactionEvent(this);
        wcp_1.default.init();
        mongo_adapter_1.default.connect(settings.mongodb.url)
            .catch(err => {
            console.error(err);
            wcp_1.default.send({ status_mongodb: '-Connection failed' });
        })
            .then(() => {
            console.log('Connected to Mongo');
            wcp_1.default.send({ status_mongodb: '+Connected' });
            tudeapi_1.default.init();
            database_1.default.init();
            let lang = key => {
                let res = require(`../config/lang.json`)[key];
                if (!res)
                    return '';
                if (res.length !== undefined)
                    return res[Math.floor(Math.random() * res.length)];
                return res;
            };
            this.modules.forEach(mod => {
                let moddata = {};
                try {
                    moddata = require(`../config/moduledata/${mod}.json`);
                }
                catch (ex) { }
                this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], moddata, lang);
            });
            this.on('ready', () => {
                console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
                wcp_1.default.send({ status_discord: '+Connected' });
            });
            this.login(settings.bot.token);
        });
    }
}
exports.TudeBot = TudeBot;
exports.Core = new TudeBot({
    disabledEvents: [
        'TYPING_START',
    ]
});
function fixReactionEvent(bot) {
    const events = {
        MESSAGE_REACTION_ADD: 'messageReactionAdd',
        MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    };
    bot.on('raw', (event) => __awaiter(this, void 0, void 0, function* () {
        const ev = event;
        if (!events.hasOwnProperty(ev.t))
            return;
        const data = ev.d;
        const user = bot.users.get(data.user_id);
        const channel = bot.channels.get(data.channel_id) || (yield user.createDM());
        if (channel.messages.has(data.message_id))
            return;
        const message = yield channel.fetchMessage(data.message_id);
        const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
        const reaction = message.reactions.get(emojiKey);
        bot.emit(events[ev.t], reaction, user);
    }));
}
//# sourceMappingURL=index.js.map