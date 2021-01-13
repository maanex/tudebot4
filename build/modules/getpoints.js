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
const cron = require("cron");
const __1 = require("..");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
const emojis_1 = require("../int/emojis");
class GetPointsModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Get Points', 'private', conf, data, guilds, lang);
        this.maxRegenValue = 20;
        this.maxTotalValue = 30;
        this.pointBags = {};
        this.messagesSentLast5Sec = {};
        this.reactionsAddedLast5Sec = {};
        this.cronjobs = [];
    }
    onEnable() {
        __1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            const messcont = mes.content;
            // // NOTHING WRONG WITH THIS CODE, JUST DISABLED, PERFORMANCE WISE - NOTHING WRONG WITH PERFORMANCE EITHER, MORE LIKE... A BIT OVERKILL AT THIS POINT, HUH?
            // let letters = [];
            // for (let letter of messcont.split(''))
            //     if (letters.indexOf(letter) < 0) letters.push(letter);
            // for (let letter of letters)
            //     messcont = messcont.split(new RegExp(letter + '+')).join(letter);
            let quality = 1;
            const messageLengthFactor = x => Math.max((-1 / x) * (x - 40) * (x - 40) / 1000 + 0.5, 0);
            const messagesLast5SecFactor = 1 / (this.messagesSentLast5Sec[mes.author.id] || 1);
            quality *= messageLengthFactor((messcont.length * 2 + mes.content.length) / 3);
            quality *= messagesLast5SecFactor;
            tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageSent', quality * 2)).catch(() => { });
            if (this.messagesSentLast5Sec[mes.author.id])
                this.messagesSentLast5Sec[mes.author.id]++;
            else
                this.messagesSentLast5Sec[mes.author.id] = 1;
            setTimeout(() => {
                if (--this.messagesSentLast5Sec[mes.author.id] <= 0)
                    delete this.messagesSentLast5Sec[mes.author.id];
            }, 5000);
            if (this.messagesSentLast5Sec[mes.author.id] > 4)
                this.punish(mes.author, 'MessageSpam');
            // this.reward previous message
            if (mes.channel.lastMessage.author.id === mes.author.id)
                return;
            if (mes.channel.lastMessage.createdTimestamp - Date.now() < 1000 * 10)
                return;
            if (this.messagesSentLast5Sec[mes.author.id] > 1)
                return;
            tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageEngagement', 0.5)).catch(() => { });
        });
        __1.TudeBot.on('messageDelete', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (this.reactionsAddedLast5Sec[mes.author.id] > 6)
                this.punish(mes.author, 'MessageDelete');
        });
        __1.TudeBot.on('messageReactionAdd', (reaction, user) => {
            const mes = reaction.message;
            if (user.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.isEnabledInGuild(mes.guild))
                return;
            let quality = 1;
            if (reaction.count === 1)
                quality = 1.2;
            quality /= (this.reactionsAddedLast5Sec[mes.author.id] || 1);
            tudeapi_1.default.clubUserByDiscordId(user.id).then(u => this.reward(u, 'MessageReaction', quality)).catch(() => { });
            if (this.reactionsAddedLast5Sec[mes.author.id])
                this.reactionsAddedLast5Sec[mes.author.id]++;
            else
                this.reactionsAddedLast5Sec[mes.author.id] = 1;
            setTimeout(() => {
                if (--this.reactionsAddedLast5Sec[mes.author.id] <= 0)
                    delete this.reactionsAddedLast5Sec[mes.author.id];
            }, 5000);
            if (this.reactionsAddedLast5Sec[mes.author.id] > 6)
                this.punish(user, 'ReactionSpam');
            // if message author real user and message sent in last hour, this.reward them too
            if (mes.author.bot)
                return;
            if (mes.createdTimestamp - Date.now() > 1000 * 60 * 60)
                return;
            tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageEngagement')).catch(() => { });
        });
        __1.TudeBot.on('messageReactionRemove', (reaction, user) => {
            const mes = reaction.message;
            if (user.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.isEnabledInGuild(mes.guild))
                return;
            tudeapi_1.default.clubUserByDiscordId(user.id).then(_u => this.punish(user, 'ReactionRemove')).catch(() => { });
        });
        __1.TudeBot.on('guildMemberAdd', (member) => {
            this.assignLevelRoles(member);
        });
        //                           m h d m dw
        this.cronjobs.push(cron.job('* * * * *', () => this.regenBags()));
        this.cronjobs.push(cron.job('0 * * * *', () => this.fillBags()));
        // this.cronjobs.push(cron.job('* * * * *', () => checkVoice(this.conf-nonononoooo.guilds.map(TudeBot.guilds.get)))); TODO error here
        this.cronjobs.forEach(j => j.start());
    }
    assignLevelRoles(member, clubUser, guild, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!member && !guild)
                return false;
            if (!member)
                member = yield guild.members.fetch(userId);
            if (!guild)
                guild = member.guild;
            if (!clubUser)
                clubUser = yield tudeapi_1.default.clubUserByDiscordId(userId || member.id, member.user);
            if (!member)
                return false;
            if (!guild)
                return false;
            if (!clubUser)
                return false;
            for (let i = 1; i <= clubUser.level; i++) {
                const roleid = this.guildData(guild).levelrewards[i];
                if (!roleid)
                    continue;
                member.roles.add(guild.roles.resolve(roleid));
            }
            return true;
        });
    }
    onBotReady() {
    }
    onDisable() {
        this.cronjobs.forEach(j => j.stop());
        this.cronjobs = [];
    }
    onUserLevelup(user, newLevel, rewards) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user.user)
                return;
            if (!user.user.accounts)
                return;
            if (!user.user.accounts.discord)
                return;
            const duser = yield __1.TudeBot.users.fetch(user.user.accounts.discord);
            if (!duser)
                return;
            let desc = `You are now **Level ${newLevel}**\n`;
            if (rewards.cookies)
                desc += `\n+${rewards.cookies} ${emojis_1.default.COOKIES}`;
            if (rewards.gems)
                desc += `\n+${rewards.gems} ${emojis_1.default.GEMS}`;
            if (rewards.keys)
                desc += `\n+${rewards.keys} ${emojis_1.default.KEYS}`;
            duser.send({
                embed: {
                    color: 0x2F3136,
                    title: "Ayyy, you've leveled up!",
                    description: desc
                }
            });
            for (const guildId of this.guilds.keys()) {
                const guild = yield __1.TudeBot.guilds.fetch(guildId);
                if (guild)
                    this.assignLevelRoles(null, user, guild, duser.id);
            }
        });
    }
    regenBags() {
        for (const user in this.pointBags) {
            if (this.pointBags[user] >= this.maxRegenValue)
                continue;
            this.pointBags[user] += Math.floor(Math.random() * 3) + 3;
        }
    }
    fillBags() {
        for (const user in this.pointBags) {
            if (this.pointBags[user] < this.maxRegenValue)
                continue;
            this.pointBags[user]++;
            if (this.pointBags[user] >= this.maxTotalValue)
                delete this.pointBags[user];
        }
    }
    checkVoice(guilds) {
        for (const guild of guilds) {
            guild.channels.cache.filter(c => c.type === 'voice').forEach((c) => {
                const mems = [];
                for (const u of c.members.array())
                    if (!u.voice.mute && !u.voice.deaf)
                        mems.push(u);
                if (mems.length > 1) {
                    for (const m of mems) {
                        tudeapi_1.default.clubUserByDiscordId(m.id).then((u) => {
                            u.points++;
                            tudeapi_1.default.updateClubUser(u);
                        }).catch(() => { });
                    }
                }
            });
        }
    }
    reward(user, reason, quality = 1) {
        let bag = this.pointBags[user.id];
        if (!bag)
            bag = (this.pointBags[user.id] = this.maxTotalValue);
        if (bag <= 0)
            return;
        let percentage = { MessageSent: 0.5, MessageReaction: 0.2, MessageEngagement: 0.1 }[reason];
        percentage *= quality;
        let points = bag * percentage;
        points = Math.floor(points);
        this.pointBags[user.id] -= points;
        const fun = (u) => {
            u.points += points;
            if (points)
                tudeapi_1.default.updateClubUser(u);
        };
        if ('points' in user)
            fun(user); // if user is clubuser, or else:
        else
            tudeapi_1.default.clubUserById(user.id).then(fun).catch();
    }
    punish(user, punishment) {
        let bag = this.pointBags[user.id];
        if (!bag)
            bag = (this.pointBags[user.id] = this.maxTotalValue);
        switch (punishment) {
            case 'MessageDelete':
                if (this.pointBags[user.id] >= -10)
                    this.pointBags[user.id] -= 10;
                break;
            case 'MessageSpam':
                if (this.pointBags[user.id] >= -100)
                    this.pointBags[user.id] -= 3;
                break;
            case 'ReactionRemove':
                this.pointBags[user.id] *= 0.5;
                break;
            case 'ReactionSpam':
                if (this.pointBags[user.id] >= -10)
                    this.pointBags[user.id] -= 1;
                break;
        }
    }
}
exports.default = GetPointsModule;
//# sourceMappingURL=getpoints.js.map