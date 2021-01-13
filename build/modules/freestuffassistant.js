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
const index_1 = require("../index");
const types_1 = require("../types/types");
class FreestuffAssistantModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Freestuff Assistant', 'private', conf, data, guilds, lang);
        this.gameMessages = new Map();
    }
    onEnable() {
    }
    onBotReady() {
    }
    onDisable() {
    }
    on(event, data) {
        this.guilds.forEach((settings, guildid) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (!settings)
                return;
            if (!index_1.TudeBot || !index_1.TudeBot.readyAt)
                return;
            const guild = yield index_1.TudeBot.guilds.fetch(guildid);
            const contentChannel = guild.channels.resolve(settings.channel_content);
            const servicesChannel = guild.channels.resolve(settings.channel_services);
            if (!contentChannel || !servicesChannel)
                return;
            // const contentMods = settings.contentMods as string[]
            const user = data.user ? yield index_1.TudeBot.users.fetch(data.user) : null;
            let mes = null;
            switch (event) {
                case 'game_found':
                    mes = (yield contentChannel.send({
                        embed: {
                            color: 0xAB6B31,
                            title: 'Free Game Found!',
                            description: `${data.game.info.title} (${data.game.info.store})\n[Outgoing announcement needs approval, please click here](${`https://dashboard.freestuffbot.xyz/content/${data.game._id}`})`
                        }
                    }));
                    this.gameMessages.set(data.game._id, mes);
                    break;
                case 'new_scratch':
                    mes = (yield contentChannel.send({
                        embed: {
                            color: 0x3190AB,
                            title: `${_b = (_a = user) === null || _a === void 0 ? void 0 : _a.username, (_b !== null && _b !== void 0 ? _b : '*Someone*')} created a new announcement`,
                            description: `No data provided yet\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
                        }
                    }));
                    this.gameMessages.set(data.game, mes);
                    break;
                case 'new_url':
                    mes = (yield contentChannel.send({
                        embed: {
                            color: 0x3190AB,
                            title: `${_d = (_c = user) === null || _c === void 0 ? void 0 : _c.username, (_d !== null && _d !== void 0 ? _d : '*Someone*')} created a new announcement`,
                            description: `Automatically fetched data from ${data.url}\n[Click here to view.](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})`
                        }
                    }));
                    this.gameMessages.set(data.game, mes);
                    break;
                case 'game_save_draft':
                    if (!this.gameMessages.has(data.game))
                        break;
                    mes = this.gameMessages.get(data.game);
                    mes.edit({
                        embed: Object.assign(Object.assign({}, mes.embeds[0]), { fields: [{
                                    name: 'Activity',
                                    value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${_f = (_e = user) === null || _e === void 0 ? void 0 : _e.username, (_f !== null && _f !== void 0 ? _f : '*Someone*')} saved changes`
                                }] })
                    });
                    break;
                case 'game_decline':
                    if (!this.gameMessages.has(data.game))
                        break;
                    mes = this.gameMessages.get(data.game);
                    mes.edit({
                        embed: Object.assign(Object.assign({}, mes.embeds[0]), { fields: [{
                                    name: 'Activity',
                                    value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${_h = (_g = user) === null || _g === void 0 ? void 0 : _g.username, (_h !== null && _h !== void 0 ? _h : '*Someone*')} declined this game.`
                                }], color: 0xAB3231, title: 'Done.', description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})` })
                    });
                    break;
                case 'game_accept':
                    if (!this.gameMessages.has(data.game))
                        break;
                    mes = this.gameMessages.get(data.game);
                    mes.edit({
                        embed: Object.assign(Object.assign({}, mes.embeds[0]), { fields: [{
                                    name: 'Activity',
                                    value: (mes.embeds[0].fields.length ? `${mes.embeds[0].fields[0].value}\n` : '') + `${_k = (_j = user) === null || _j === void 0 ? void 0 : _j.username, (_k !== null && _k !== void 0 ? _k : '*Someone*')} approved this game.`
                                }], color: 0x59AB31, title: 'Done.', description: `[View in CMS](${`https://dashboard.freestuffbot.xyz/content/${data.game}`})` })
                    });
                    break;
                case 'manual_store_scrape':
                    contentChannel.send({
                        embed: {
                            color: 0x2F3136,
                            title: `${_m = (_l = user) === null || _l === void 0 ? void 0 : _l.username, (_m !== null && _m !== void 0 ? _m : '*Someone*')} initiated manual store scraping. Target: ${data.store}`
                        }
                    });
                    break;
                case 'service_status':
                    // eslint-disable-next-line no-case-declarations
                    const colors = { fatal: 0xED1A52, rebooting: 0x3586E8, offline: 0xDB6D42, timeout: 0xDB9C1F, partial: 0xE3E352, ok: 0x52E36F };
                    servicesChannel.send({
                        embed: {
                            color: colors[data.status] || 0x2F3136,
                            title: `Service ${data.service}/${data.suid} is now \`${data.status}\``
                        }
                    });
                    break;
                default:
                    contentChannel.send({
                        embed: {
                            color: 0x2F3136,
                            title: `Unknown raw event: ${event}`
                        }
                    });
                    break;
            }
        }));
    }
}
exports.default = FreestuffAssistantModule;
//# sourceMappingURL=freestuffassistant.js.map