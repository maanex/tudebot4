"use strict";
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
        for (let guildid of this.guilds.keys()) {
            let guild = index_1.TudeBot.guilds.get(guildid);
            if (!guild)
                return;
            for (let channelid of this.guilds.get(guildid).channels) {
                const channel = guild.channels.get(channelid);
                if (!channel)
                    return;
                this.channels.push(channel);
            }
        }
    }
    onDisable() {
    }
    update(channel) {
        channel.fetchMessages().then(mes => {
            if (mes.size) {
                let c = 0;
                for (let m of mes.array()) {
                    if (m.author.id != index_1.TudeBot.user.id)
                        continue;
                    c++;
                }
            }
            else {
                index_1.TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated!\nChannel does not contain messages or messages could not get fetched!\nPlease run `admin setupemptychannel ' + channel.id + '`');
            }
        }).catch(err => {
            index_1.TudeBot.modlog(channel.guild, 'warning', 'Bulletin Board could not get updated! Error: ```' + err + '```');
        });
    }
}
exports.default = ClubBulletinBoardModule;
//# sourceMappingURL=clubbulletinboard.js.map