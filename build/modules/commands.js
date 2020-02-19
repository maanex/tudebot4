"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbstats_1 = require("../database/dbstats");
const database_1 = require("../database/database");
const wcp_1 = require("../thirdparty/wcp/wcp");
const chalk = require("chalk");
const types_1 = require("../types");
class CommandsModule extends types_1.Module {
    constructor(bot, conf, data, lang) {
        super('Commands', 'private', bot, conf, data, lang);
        this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60000;
        this.commands = [];
        this.activeInCommandsChannel = [];
        this.activeInCommandsChannelRemoveTimer = {};
    }
    onEnable() {
        this.loadCommands();
        this.bot.on('message', (mes) => {
            if (mes.author.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
                return;
            this.updateActiveInCommandsChannel(mes.author.id);
            let txt = mes.content;
            let args = txt.split(' ');
            let cmd = args.splice(0, 1)[0].toLowerCase();
            let sudo = false;
            if (cmd === 'sudo' || cmd.charAt(0) == '$') {
                sudo = true;
                if (cmd.charAt(0) == '$') {
                    cmd = cmd.substring(1);
                    if (!cmd)
                        return;
                }
                else {
                    cmd = args.splice(0, 1)[0].toLowerCase();
                    if (!cmd) {
                        this.cmes(mes.channel, mes.author, '`sudo <command> [args..]`');
                        return;
                    }
                }
            }
            let command;
            out: for (let c of this.commands) {
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
                    this.cmes(mes.channel, mes.author, ':x: Not allowed!');
                    return;
                }
                let success = command.execute(this.bot, mes, sudo, args, this.cmes);
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
                this.cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    loadCommands() {
        this.commands = [];
        database_1.default
            .collection('settings')
            .findOne({ _id: 'commands' })
            .then(obj => {
            wcp_1.default.send({ config_commands: JSON.stringify(obj.data) });
            let allCmdaliases = [];
            for (let c in obj.data)
                if (obj.data[c]) {
                    let cmd = require(`../commands/${c}`);
                    if (cmd.init)
                        cmd.init(this.bot);
                    this.commands.push(cmd);
                    for (let a of [cmd.name, ...cmd.aliases]) {
                        if (allCmdaliases.indexOf(a) >= 0)
                            console.log(chalk.red(`Command "${a}" is declared multiple times!`));
                        else
                            allCmdaliases.push(a);
                    }
                }
        })
            .catch(console.error);
    }
    getCommands() {
        return this.commands;
    }
    getActiveInCommandsChannel() {
        return this.activeInCommandsChannel;
    }
    cmes(channel, author, text, type, description, settings) {
        if (type == 'error')
            text = ':x: ' + text;
        // if (type == 'bad') text = ':frowning: ' + text;
        if (type == 'success')
            text = ':white_check_mark: ' + text;
        channel.send({
            embed: {
                color: 0x2f3136,
                title: description ? `${text}` : '',
                description: description ? `${description || ''}` : `${text}`,
                footer: {
                    text: '@' + author.username + (type == 'bad' ? ' • not successful' : '')
                },
                thumbnail: { url: settings && settings.image },
                image: { url: settings && settings.banner }
            }
        });
    }
    updateActiveInCommandsChannel(id) {
        if (!this.activeInCommandsChannel.includes(id)) {
            this.activeInCommandsChannel.push(id);
            this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
                this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
                delete this.activeInCommandsChannelRemoveTimer[id];
            }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
        }
        else {
            clearTimeout(this.activeInCommandsChannelRemoveTimer[id]);
            this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
                this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
                delete this.activeInCommandsChannelRemoveTimer[id];
            }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
        }
    }
}
exports.default = CommandsModule;
//# sourceMappingURL=commands.js.map