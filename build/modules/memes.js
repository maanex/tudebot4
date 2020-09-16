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
const dbstats_1 = require("../database/dbstats");
const emojis_1 = require("../int/emojis");
const database_1 = require("../database/database");
const cron = require("cron");
class MemesModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Memes', 'public', conf, data, guilds, lang);
        this.RATINGS = {
            '⭐': +3,
            '🔥': +2,
            '⬆️': +1,
            '⬇️': -1,
            '💩': -2,
        };
        this.selfUpvoteCooldown = [];
        this.cronjobs = [];
    }
    onEnable() {
        index_1.TudeBot.on('message', mes => {
            if (!this.isMessageEventValid(mes))
                return;
            if (!mes.attachments.size)
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            dbstats_1.DbStats.getUser(mes.author).then(u => u.memesSent++);
            let emojis = Object.keys(this.RATINGS);
            if (` ${mes.content} `.includes(' f '))
                emojis.push(':pay_respect:496359590087098409');
            if (mes.content.match(/doo+t/i))
                emojis.push(':doot:496770649562415115');
            if (mes.content.match(/dank/i))
                emojis.push('🇩', '🇦', '🇳', '🇰');
            for (let me of ['meirl', 'me irl', 'me_irl', 'ichiel', 'ich_iel', 'ich iel']) {
                if (mes.content.toLowerCase().includes(me)) {
                    emojis.push(':meirl:496357154199044097');
                    break;
                }
            }
            let counter = 0;
            for (let e of emojis)
                setTimeout(() => mes.react(e), counter++ * 500);
            if (Math.floor(Math.random() * 500) == 0) {
                let gif = (["https://cdn.discordapp.com/attachments/497071913718382604/497071937772847104/giphy.gif",
                    "https://cdn.discordapp.com/attachments/497071913718382604/497071942323666945/giphy2.gif",
                    "https://cdn.discordapp.com/attachments/497071913718382604/497071959595548683/giphy3.gif"])[Math.floor(Math.random() * 3)];
                mes.channel.send({
                    embed: {
                        color: 0x2f3136,
                        image: { url: gif }
                    }
                });
            }
            if (this.guildData(mes.guild).motm && this.guildData(mes.guild).channels[0] == mes.channel.id) {
                database_1.default
                    .collection('memes')
                    .insertOne({
                    _id: mes.id,
                    author: mes.author.id,
                    caption: mes.content,
                    image: mes.attachments.first().url,
                    rating: 0
                });
            }
        });
        index_1.TudeBot.on('messageReactionAdd', (reaction, user) => {
            let mes = reaction.message;
            if (user.bot)
                return;
            if (mes.author.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.isEnabledInGuild(mes.guild))
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            if (!mes.attachments.size)
                return;
            if (this.RATINGS[reaction.emoji.name]) {
                const rating = this.RATINGS[reaction.emoji.name];
                if (rating > 0 && reaction.emoji.name != '⭐' && mes.author.id == user.id && !this.selfUpvoteCooldown.includes(mes.author.id)) {
                    mes.channel.send(this.lang('meme_upvote_own_post', {
                        user: user.toString(),
                        username: user.username,
                        not_cool: emojis_1.default.NOT_COOL
                    }));
                    this.selfUpvoteCooldown.push(mes.author.id);
                    setTimeout(() => this.selfUpvoteCooldown.splice(this.selfUpvoteCooldown.indexOf(mes.author.id), 1), 1000 * 60 * 5);
                }
            }
            this.updateMemeRating(mes);
            if (reaction.emoji.name == '⭐') {
                user.send({
                    embed: {
                        color: 0x2f3136,
                        image: { url: mes.attachments.first().url },
                        description: `[${mes.content || '[link]'}](https://discordapp.com/channels/${mes.guild.id}/${mes.channel.id}/${mes.id})`,
                        footer: { text: `Uploaded by ${mes.author.username}` },
                        timestamp: mes.createdTimestamp
                    }
                });
            }
        });
        index_1.TudeBot.on('messageReactionRemove', (reaction, user) => {
            let mes = reaction.message;
            if (user.bot)
                return;
            if (mes.author.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.isEnabledInGuild(mes.guild))
                return;
            if (!this.guildData(mes.guild).channels.includes(mes.channel.id))
                return;
            if (!mes.attachments.size)
                return;
            this.updateMemeRating(mes);
        });
    }
    updateMemeRating(mes) {
        if (this.guildData(mes.guild).motm && this.guildData(mes.guild).channels[0] == mes.channel.id) {
            let rating = -Object.values(this.RATINGS)['stack']();
            for (const reaction of mes.reactions.array()) {
                if (this.RATINGS[reaction.emoji.name])
                    rating += this.RATINGS[reaction.emoji.name] * reaction.count;
            }
            database_1.default
                .collection('memes')
                .updateOne({ _id: mes.id }, {
                '$set': {
                    rating: rating
                }
            });
        }
    }
    onBotReady() {
        //                           m h d m dw
        this.cronjobs.push(cron.job('0 6 1 * *', () => this.electMemeOfTheMonth()));
    }
    onDisable() {
        this.cronjobs.forEach(j => j.stop());
        this.cronjobs = [];
    }
    electMemeOfTheMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            const top5 = yield database_1.default
                .collection('memes')
                .find({}, {
                sort: { rating: -1 },
                limit: 5,
            })
                .toArray();
            if (!top5.length)
                return;
            this.guilds.forEach((data, gid) => __awaiter(this, void 0, void 0, function* () {
                if (data.motm && data.channels[0] == gid) {
                    const guild = index_1.TudeBot.guilds.get(gid);
                    if (!guild)
                        return;
                    const channel = guild.channels.get(data.channels[0]);
                    for (const meme of top5) {
                        meme.message = yield channel.fetchMessage(meme._id);
                    }
                    while (top5.length && !top5[0].message)
                        top5.splice(0, 1);
                    if (!top5.length)
                        return;
                    const now = new Date();
                    channel.send({ embed: {
                            title: `Meme Of The Month • ${this.lang('meme_month_' + ((now.getMonth() + 11) % 12))} ${now.getFullYear()}`,
                            description: `by ${top5[0].message.author} (▲${top5[0].rating})` + (top5[0].caption ? `\n\n**${top5[0].caption}**` : ''),
                            image: { url: top5[0].image },
                            color: 0x2f3136
                        } }).then(mes => {
                        const top1 = top5.splice(0, 1)[0];
                        channel.send({ embed: {
                                fields: [{
                                        name: 'Honorable Mentions',
                                        value: top5.map((v, i) => `[**#${i + 2}**](https://discordapp.com/channels/${gid}/${channel.id}/${v.message.id}) by ${v.message.author} (▲${v.rating})`).join('\n')
                                    }],
                                color: 0x2f3136
                            } }).then(mes2 => {
                            if (!top1.message.pinned && top1.message.pinnable)
                                top1.message.pin();
                            database_1.default
                                .collection('memes')
                                .deleteMany({});
                        });
                    });
                }
            }));
        });
    }
}
exports.default = MemesModule;
//# sourceMappingURL=memes.js.map