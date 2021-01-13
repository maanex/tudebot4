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
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const emojis_1 = require("../int/emojis");
class ExternalRewardsModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('External Rewards', 'public', conf, data, guilds, lang);
    }
    onEnable() {
    }
    onBotReady() {
    }
    onDisable() {
    }
    reward(name, target, messageParams) {
        if (!target)
            return;
        this.guilds.forEach((data, guildid) => __awaiter(this, void 0, void 0, function* () {
            const settings = data.rewards[name];
            if (!settings)
                return;
            if (!index_1.TudeBot || !index_1.TudeBot.readyAt)
                return;
            const guild = yield index_1.TudeBot.guilds.fetch(guildid);
            if (!(yield guild.members.fetch(target)))
                return;
            const channel = guild.channels.resolve(settings.channel);
            if (!channel)
                return;
            const res = yield tudeapi_1.default.performClubUserActionRaw(`find?discord=${target.id}`, { id: 'obtain_perks', perks: settings.rewards });
            const perks = res.perks;
            const message = index_1.TudeBot.optionalLang(settings.message, Object.assign(Object.assign({}, messageParams), { user: target.toString(), username: target.username, cookies: this.findPerk(perks, 'club.cookies', '0'), gems: this.findPerk(perks, 'club.gems', '0'), keys: this.findPerk(perks, 'club.keys', '0'), points: this.findPerk(perks, 'club.points', '0'), cookies_emoji: emojis_1.default.COOKIES, gems_emoji: emojis_1.default.GEMS, keys_emoji: emojis_1.default.KEYS, points_emoji: emojis_1.default.POINTS, big_space: emojis_1.default.BIG_SPACE }));
            channel.send({
                embed: {
                    color: 0x2F3136,
                    title: message.includes('|') ? message.split('|')[0] : '',
                    description: message.includes('|') ? message.split('|')[1] : message
                }
            });
        }));
    }
    findPerk(perks, name, orElse) {
        const perk = perks.find(p => p.startsWith(name + ':'));
        if (!perk)
            return orElse;
        return perk.split(':')[1];
    }
}
exports.default = ExternalRewardsModule;
//# sourceMappingURL=externalrewards.js.map