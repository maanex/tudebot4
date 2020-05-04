"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
const generateInviteLinkMeme_1 = require("../functions/generateInviteLinkMeme");
const chalk = require("chalk");
class AutoSupportModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('ChatGuard Automod', 'public', conf, data, guilds, lang);
        /* */
        this.inviteResponseStatus = 0;
    }
    onEnable() {
        index_1.TudeBot.on('message', (mes) => {
            if (!this.isMessageEventValid(mes))
                return;
            if (mes.member.highestRole.comparePositionTo(mes.guild.me.highestRole) > 0)
                return; // TODO REENABLE, DISABLED FOR EASIER TESTING
            if (this.checkInviteLinks(mes))
                return;
            index_1.TudeBot.perspectiveApi.analyze(mes.content).then(res => {
                console.log(chalk `{gray >>} {white ${res.input}}
{gray  Flirt:} {${res.flirtation < .5 ? 'white' : (res.flirtation > .8 ? 'red' : 'yellow')} ${res.flirtation.toFixed(4)} ${'░'.repeat(Math.floor(res.flirtation * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.flirtation * 10))}}
{gray Attack:} {${res.identityAttack < .5 ? 'white' : (res.identityAttack > .8 ? 'red' : 'yellow')} ${res.identityAttack.toFixed(4)} ${'░'.repeat(Math.floor(res.identityAttack * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.identityAttack * 10))}}
{gray Insult:} {${res.insult < .5 ? 'white' : (res.insult > .8 ? 'red' : 'yellow')} ${res.insult.toFixed(4)} ${'░'.repeat(Math.floor(res.insult * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.insult * 10))}}
{gray  Toxic:} {${res.toxicity < .5 ? 'white' : (res.toxicity > .8 ? 'red' : 'yellow')} ${res.toxicity.toFixed(4)} ${'░'.repeat(Math.floor(res.toxicity * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.toxicity * 10))}}

`);
                if (res.toxicity > .95) {
                    mes.reply('Dude, chill!');
                }
            });
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    repl(message, title, description) {
        message.channel.send({
            embed: {
                color: 0x2f3136,
                title: title,
                description: description,
                footer: { text: 'ChatGuard • Auto Moderator' }
            }
        });
    }
    checkInviteLinks(mes) {
        if (!/discord.gg\/.+/i.test(mes.content) && !/discordapp.com\/invite\/.+/i.test(mes.content))
            return false;
        if (this.inviteResponseStatus == 0) {
            generateInviteLinkMeme_1.default(mes.author.username)
                .then(img => {
                const file = new discord_js_1.Attachment(img, `shut-up-${mes.author.username.toLowerCase()}.png`);
                const embed = new discord_js_1.RichEmbed()
                    .attachFile(file)
                    .setColor(0x2f3136)
                    .setImage(`attachment://shut-up-${mes.author.username.toLowerCase()}.png`);
                mes.channel.send(embed);
            })
                .catch(err => {
                console.error(err);
                this.repl(mes, 'No invite links!', 'Please do not advertise here, thanks!');
            });
        }
        else if (this.inviteResponseStatus == 1) {
            this.repl(mes, 'I was not kidding!', 'No advertising here. And no Discord invite links!');
        }
        else if (this.inviteResponseStatus == 5) {
            this.repl(mes, 'See, I tried to stay calm but enough is enough!', 'Now would you please shut the fu*** up and stop posting invite links?');
        }
        this.inviteResponseStatus++;
        setTimeout(i => i.inviteResponoseStatus--, 5 * 60 * 1000, this);
        index_1.TudeBot.modlog(mes.guild, 'clean_chat', `${mes.author} sent an invite link.`);
        mes.delete();
        return true;
    }
}
exports.default = AutoSupportModule;
//# sourceMappingURL=cleanchat.js.map