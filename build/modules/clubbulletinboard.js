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
class ClubBulletinBoardModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Club Bulletin Board', 'private', conf, data, guilds, lang);
        this.channels = [];
    }
    onEnable() {
    }
    onBotReady() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const guildid of this.guilds.keys()) {
                const guild = yield index_1.TudeBot.guilds.fetch(guildid);
                if (!guild)
                    return;
                for (const channelid of this.guilds.get(guildid).channels) {
                    const channel = guild.channels.resolve(channelid);
                    if (!channel)
                        return;
                    this.channels.push(channel);
                }
            }
        });
    }
    onDisable() {
    }
    update(channel) {
        channel.messages.fetch().then((mes) => {
            if (mes.size) {
                for (const m of mes.array())
                    if (m.author.id !== index_1.TudeBot.user.id)
                        continue;
            }
            else {
                index_1.TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`', 'medium');
            }
        }).catch((err) => {
            index_1.TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated! Error: ```' + err + '```', 'medium');
        });
    }
}
exports.default = ClubBulletinBoardModule;
//# sourceMappingURL=clubbulletinboard.js.map