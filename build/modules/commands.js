"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbstats_1 = require("../database/dbstats");
const util = require('../util');
exports.commands = [];
for (let c of [
    'botinfo',
    'catimg',
    'dogimg',
    'jokes',
    'eval',
    'wubbalubba',
    'freestuff',
    'inspiration',
    'profile',
    'uinfo',
    'roulette',
    'reload',
    'daily',
    'badges',
    'slotmachine',
    'blackjack',
])
    exports.commands.push(require(`../commands/${c}`));
exports.activeInCommandsChannel = [];
let activeInCommandsChannelRemoveTimer = {};
const ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60000;
module.exports = (bot, conf, data, lang) => {
    bot.on('message', (mes) => {
        if (mes.author.bot)
            return;
        if (!mes.guild)
            return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
            return;
        updateActiveInCommandsChannel(mes.author.id);
        let txt = mes.content;
        let args = txt.split(' ');
        let cmd = args.splice(0, 1)[0].toLowerCase();
        let sudo = false;
        if (cmd === 'sudo') {
            sudo = true;
            cmd = args.splice(0, 1)[0].toLowerCase();
            if (!cmd) {
                cmes(mes.channel, mes.author, '`sudo <command> [args..]`');
                return;
            }
        }
        let command;
        out: for (let c of exports.commands) {
            if (c.name === cmd) {
                command = c;
                break out;
            }
            for (let a of c.aliases)
                if (a === cmd) {
                    command = c;
                    break out;
                }
        }
        if (command) {
            if (command.sudoonly && !sudo) {
                cmes(mes.channel, mes.author, ':x: Not allowed!');
                return;
            }
            let success = command.execute(bot, mes, sudo, args, cmes);
            dbstats_1.DbStats.getCommand(command.name).then(c => {
                c.calls.updateToday(1);
                if (success['then']) {
                    success.then(bool => {
                        if (bool)
                            c.executions.updateToday(1);
                    }).catch();
                }
                else if (success)
                    c.executions.updateToday(1);
            });
        }
        else if (sudo)
            cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
    });
};
function cmes(channel, author, text, type, description, settings) {
    if (type == 'error')
        text = ':x: ' + text;
    if (type == 'bad')
        text = ':frowning: ' + text;
    if (type == 'success')
        text = ':white_check_mark: ' + text;
    channel.send({
        embed: {
            color: 0x36393f,
            title: description ? `${text}` : '',
            description: description ? `${description || ''}` : `${text}`,
            footer: {
                text: '@' + author.username,
            },
            thumbnail: { url: settings && settings.image },
            image: { url: settings && settings.banner }
        }
    });
}
function updateActiveInCommandsChannel(id) {
    if (!exports.activeInCommandsChannel.includes(id)) {
        exports.activeInCommandsChannel.push(id);
        activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
            exports.activeInCommandsChannel.splice(exports.activeInCommandsChannel.indexOf(id));
            delete activeInCommandsChannelRemoveTimer[id];
        }, ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    }
    else {
        clearTimeout(activeInCommandsChannelRemoveTimer[id]);
        activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
            exports.activeInCommandsChannel.splice(exports.activeInCommandsChannel.indexOf(id));
            delete activeInCommandsChannelRemoveTimer[id];
        }, ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    }
}
//# sourceMappingURL=commands.js.map