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
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
class QuotesModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Auto Leaderboard', 'private', conf, data, guilds, lang);
        this.UPDATE_COOLDOWN = 2 * 60000;
        this.UPDATE_EMOJI = '🔄';
        this.channels = [];
    }
    onEnable() {
        index_1.TudeBot.on('messageReactionAdd', (reaction, user) => {
            const mes = reaction.message;
            if (user.bot)
                return;
            if (!this.isEnabledInGuild(mes.guild))
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            if (reaction.emoji.name === this.UPDATE_EMOJI)
                this.update(mes.channel);
        });
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
            let lastmin = 0;
            this.interval = setInterval(() => {
                const currmin = new Date().getMinutes();
                if (currmin === lastmin)
                    return;
                lastmin = currmin;
                if (currmin !== 0)
                    return;
                this.channels.forEach(c => this.update(c));
            }, 30000);
            this.channels.forEach(c => this.update(c));
        });
    }
    onDisable() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    update(channel) {
        this.generateLeaderboard(channel.guild).then((content) => {
            channel.messages.fetch().then((m) => {
                if (m.size) {
                    const mes = m.first();
                    mes.edit(content);
                    mes.reactions.removeAll();
                    setTimeout(() => {
                        mes.react(this.UPDATE_EMOJI);
                    }, this.UPDATE_COOLDOWN);
                }
                else {
                    channel.send(content).then((mes) => {
                        mes.react(this.UPDATE_EMOJI);
                    }).catch((err) => {
                        index_1.TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
                    });
                }
            }).catch((err) => {
                index_1.TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
            });
        }).catch((err) => {
            index_1.TudeBot.modlog(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
        });
    }
    generateLeaderboard(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield tudeapi_1.default.clubLeaderboard();
            let out = '   | All Time           | This Month         | Cookies            | Daily Streak\n---+--------------------+--------------------+--------------------+-------------------';
            for (let i = 0; i < 10; i++) {
                const [ats, tms, cos, dss] = yield Promise.all([
                    this.generateEntry(guild, leaderboard.alltime[i], 'level', false, 'lv'),
                    this.generateEntry(guild, leaderboard.month[i], 'points_month', true),
                    this.generateEntry(guild, leaderboard.cookies[i], 'cookies', true),
                    this.generateEntry(guild, leaderboard.dailystreak[i], 'daily.streak', true)
                ]);
                out += `\n${((i + 1) + '. ').slice(0, 3)}| ${ats} | ${tms} | ${cos} | ${dss}`;
            }
            out += `\nLast Update: ${new Date(leaderboard.updated)}`;
            if (new Date().getHours() === 0) { // Whale fact time
                out += '``` ```fix\nWhale fact of the day: ';
                const facts = this.data.whalefacts;
                out += facts[new Date().getDate() % facts.length];
            }
            return '```cs\n' + out + '```';
        });
    }
    generateEntry(guild, entry, field, bignums, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            let u;
            try {
                u = entry ? (yield guild.members.fetch(entry.user.accounts.discord)) : null;
            }
            catch (err) {
                u = null;
            }
            if (!entry)
                return '                  ';
            const value = this.parseEntryfield(entry, field);
            let outval = value + '';
            if (bignums) {
                if (value > 999999)
                    outval = `${Math.round(value / 1000000)}m`;
                else if (value > 9999)
                    outval = `${Math.round(value / 1000)}k`;
            }
            if (prefix)
                return `${u ? u.user.username : entry.user.name}..............`.slice(0, 15 - prefix.length) + `..${prefix}${outval}`.slice(-3 - prefix.length);
            else
                return `${u ? u.user.username : entry.user.name}................`.slice(0, 13) + `......${outval}`.slice(-5);
        });
    }
    parseEntryfield(entry, field) {
        let out = entry;
        for (const key of field.split('.'))
            out = out[key];
        return out;
    }
}
exports.default = QuotesModule;
//# sourceMappingURL=autoleaderboard.js.map