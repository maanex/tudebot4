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
const util_1 = require("./util/util");
const gitParser_1 = require("./util/gitParser");
const chalk = require("chalk");
const parseArgs_1 = require("./util/parseArgs");
const settings = require('../config/settings.json');
class TudeBotClient extends discord_js_1.Client {
    constructor(props, flags) {
        super(props);
        this.config = settings;
        this.modules = null;
        this.guildSettings = null;
        this.devMode = !!flags['dev'];
        this.modlog = null;
        this.modules = new Map();
        this.guildSettings = new Map();
        if (this.devMode) {
            console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
        }
        gitParser_1.logVersionDetails();
        fixReactionEvent(this);
        util_1.Util.init();
        wcp_1.default.init(false /* this.devMode */);
        mongo_adapter_1.default.connect(settings.mongodb.url)
            .catch(err => {
            console.error(err);
            wcp_1.default.send({ status_mongodb: '-Connection failed' });
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('Connected to Mongo');
            wcp_1.default.send({ status_mongodb: '+Connected' });
            yield tudeapi_1.default.init(settings.lang);
            yield database_1.default.init();
            this.on('ready', () => {
                console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
                wcp_1.default.send({ status_discord: '+Connected' });
                for (let mod of this.modules.values()) {
                    mod.onBotReady();
                }
            });
            yield this.loadGuilds(false);
            yield this.loadModules(false);
            this.login(settings.bot.token);
        }));
    }
    loadGuilds(isReload) {
        return new Promise((resolve, reject) => {
            database_1.default
                .collection('settings')
                .find({ guild: true })
                .toArray()
                .then(guilds => {
                this.guildSettings = new Map();
                for (const guild of guilds) {
                    const setting = {
                        id: guild._id,
                        name: guild.name,
                        club: guild.club,
                        managers: guild.managers,
                        modules: guild.modules
                    };
                    this.guildSettings.set(guild._id, setting);
                }
                resolve();
            })
                .catch(err => {
                console.error('An error occured while fetching guild configuration data');
                console.error(err);
                reject(err);
            });
        });
    }
    loadModules(isReload) {
        return new Promise((resolve, reject) => {
            database_1.default
                .collection('settings')
                .findOne({ _id: 'modules' })
                .then(data => {
                data = data.data;
                wcp_1.default.send({ config_modules: JSON.stringify(data) });
                for (let mod of this.modules.values()) {
                    mod.onDisable();
                }
                this.modules = new Map();
                this.modlog = undefined;
                for (let mod in data) {
                    let modData = {};
                    try {
                        modData = require(`../config/moduledata/${mod}.json`);
                    }
                    catch (ex) { }
                    let guilds = new Map();
                    for (const guild of this.guildSettings.values()) {
                        if (guild.modules[mod])
                            guilds.set(guild.id, guild.modules[mod]);
                    }
                    try {
                        const ModClass = require(`./modules/${mod}`).default;
                        let module = new ModClass(data[mod], modData, guilds, this.lang);
                        this.modules.set(mod, module);
                        if (isReload)
                            module.onBotReady();
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
                for (let module of this.modules.values()) {
                    module.onEnable();
                }
                resolve();
            })
                .catch(err => {
                console.error('An error occured while fetching module configuration data');
                console.error(err);
                reject(err);
            });
        });
    }
    lang(key) {
        let res = require(`../config/lang.json`)[key];
        if (!res)
            return '';
        if (res.length !== undefined)
            return res[Math.floor(Math.random() * res.length)];
        return res;
    }
    reload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.removeAllListeners();
            fixReactionEvent(this);
            yield this.loadGuilds(true);
            yield this.loadModules(true);
            this.emit('ready');
            resolve();
        }));
    }
    getModule(name) {
        return this.modules.get(name);
    }
}
exports.TudeBotClient = TudeBotClient;
const flags = parseArgs_1.default.parse(process.argv);
exports.TudeBot = new TudeBotClient({}, flags);
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