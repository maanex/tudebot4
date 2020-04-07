"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const types_1 = require("../types");
const dbstats_1 = require("../database/dbstats");
const emojis_1 = require("../int/emojis");
const database_1 = require("../database/database");
class MemesModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Memes', 'public', conf, data, guilds, lang);
        this.RATINGS = {
            '🔥': +2,
            '⬆️': +1,
            '⬇️': -1,
            '💩': -2,
        };
        this.selfUpvoteCooldown = [];
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
            let emojis = ['⭐', '🔥', '⬆️', '⬇️', '💩'];
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
            if (this.guildData(mes.guild).motm) {
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
                if (rating > 0 && mes.author.id == user.id && !this.selfUpvoteCooldown.includes(mes.author.id)) {
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
        if (this.guildData(mes.guild).motm) {
            let rating = 0;
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
    }
    onDisable() {
    }
}
exports.default = MemesModule;
//# sourceMappingURL=memes.js.map