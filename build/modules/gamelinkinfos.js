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
const gibu_games_api_1 = require("../thirdparty/gibuapis/gibu-games-api");
const emojis_1 = require("../int/emojis");
class GameLinkInfos extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Game Link Infos', 'private', conf, data, guilds, lang);
        this.regexForSteam = /https?:\/\/store.steampowered\.com\/app\/[\w/]*.*/g;
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (this.guildData(mes.guild).channels && !this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            const urls = mes.content.matchAll(this.regexForSteam);
            for (const url of urls)
                this.checkUrl(url[0], this.sendPlaceholderMessage(mes));
        });
    }
    sendPlaceholderMessage(replyTo) {
        return replyTo.channel.send({
            embed: {
                description: emojis_1.default.LOADING,
                color: 0x2F3136
            },
            message_reference: {
                message_id: replyTo.id,
                channel_id: replyTo.channel.id,
                guild_id: replyTo.guild.id,
                fail_if_not_exists: false
            }
        });
    }
    checkUrl(url, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield gibu_games_api_1.default.getDetails(url);
            const message = yield context;
            message.edit(((_a = data) === null || _a === void 0 ? void 0 : _a.description_short) || 'Nothing found!');
        });
    }
    //
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = GameLinkInfos;
//# sourceMappingURL=gamelinkinfos.js.map