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
class MusicBotEnhancer extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Music Bot Enhancer', 'private', conf, data, guilds, lang);
        this.parserFor = {
            hydra: this.parserForHydra
        };
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            var _a;
            const opts = (_a = this.guildData(mes.guild)) === null || _a === void 0 ? void 0 : _a[mes.author.id];
            if (!opts)
                return;
            const parser = this.parserFor[opts.parser];
            if (!parser)
                return;
            const song = parser(mes);
            if (!song)
                return;
            const nickname = `${opts.prefix} ${song}`;
            mes.member.setNickname(nickname);
        });
        index_1.TudeBot.on('voiceStateUpdate', (before, after) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!((_a = after) === null || _a === void 0 ? void 0 : _a.channelID)) {
                const opts = (_b = this.guildData(before.guild)) === null || _b === void 0 ? void 0 : _b[before.id];
                if (!opts)
                    return;
                const member = yield before.guild.members.fetch(before.id);
                member.setNickname(`${opts.prefix} ${opts.nickname}`);
            }
        }));
    }
    //
    parserForHydra(message) {
        var _a, _b, _c, _d;
        if (!message.embeds.length)
            return '';
        const embed = message.embeds[0];
        if (!((_b = (_a = embed.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes('playing')))
            return '';
        const latter = (_d = (_c = embed.description) === null || _c === void 0 ? void 0 : _c.split('](')) === null || _d === void 0 ? void 0 : _d[0];
        if (!latter)
            return '';
        let name = latter.substr(1);
        if (name.length > 26) {
            if (name.includes(' - '))
                name = name.split(' - ')[1];
        }
        if (name.length > 26)
            name = name.substr(0, 24) + '...';
        return name;
    }
    //
    onBotReady() {
    }
    onDisable() {
    }
}
exports.default = MusicBotEnhancer;
//# sourceMappingURL=musicbotenhancer.js.map