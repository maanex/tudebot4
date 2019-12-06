"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('../util');
let commands = [];
for (let c of [
    'botinfo',
    'catimg',
    'dogimg',
    'jokes',
    'eval',
    'wubbalubba',
    'freestuff',
    'inspiration',
])
    commands.push(require(`../commands/${c}`));
module.exports = (bot, conf, data, lang) => {
    bot.on('message', (mes) => {
        if (mes.author.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
            return;
        let txt = mes.content;
        let args = txt.split(' ');
        let cmd = args.splice(0, 1)[0];
        let sudo = false;
        if (cmd === 'sudo') {
            sudo = true;
            cmd = args.splice(0, 1)[0];
            if (!cmd) {
                cmes(mes.channel, mes.author, '`sudo <command> [args..]`');
                return;
            }
        }
        for (let c of commands) {
            if (c.name === cmd) {
                if (c.sudoonly && !sudo) {
                    cmes(mes.channel, mes.author, ':x: Not allowed!');
                    return;
                }
                c.execute(bot, mes, sudo, args, cmes);
                return;
            }
            for (let a of c.aliases)
                if (a === cmd) {
                    if (c.sudoonly && !sudo) {
                        cmes(mes.channel, mes.author, ':x: Not allowed!');
                        return;
                    }
                    c.execute(bot, mes, sudo, args, cmes);
                    return;
                }
        }
        if (sudo)
            cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
    });
};
function cmes(channel, author, text, type) {
    if (type == 'error')
        text = ':x: ' + text;
    if (type == 'bad')
        text = ':frowning: ' + text;
    let title = type == 'title';
    channel.send({
        embed: {
            color: 0x36393f,
            title: title ? `${text}` : '',
            description: title ? '' : `${text}`,
            footer: {
                text: author.username,
                icon_url: author.avatarURL
            }
        }
    });
}
//# sourceMappingURL=commands.js.map