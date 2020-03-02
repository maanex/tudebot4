"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const dbstats_1 = require("../database/dbstats");
const database_1 = require("../database/database");
const wcp_1 = require("../thirdparty/wcp/wcp");
const chalk = require("chalk");
const types_1 = require("../types");
const _unavailable_1 = require("../commands/_unavailable");
class CommandsModule extends types_1.Module {
    constructor(conf, data, lang) {
        super('Commands', 'public', conf, data, lang);
        this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60000;
        this.activeInCommandsChannel = [];
        this.activeInCommandsChannelRemoveTimer = {};
        this.commands = [];
        this.identifierMap = new Map();
        this.cooldown = new Map();
    }
    onEnable() {
        this.loadCommands();
        index_1.TudeBot.on('message', (mes) => {
            if (mes.author.bot)
                return;
            if (!mes.guild)
                return;
            if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`))
                return;
            this.updateActiveInCommandsChannel(mes.author.id);
            const txt = mes.content;
            const args = txt.split(' ');
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
            const command = this.identifierMap.get(cmd);
            if (command) {
                if (command.sudoOnly && !sudo) {
                    this.cmes(mes.channel, mes.author, ':x: Not allowed!', 'bad');
                    return;
                }
                if (this.cooldown.get(command.name).includes(mes.author.id)) {
                    this.cmes(mes.channel, mes.author, 'Please wait a bit!', 'bad', `This command has a ${command.cooldown}s cooldown!`);
                    return;
                }
                function update(success) {
                    dbstats_1.DbStats.getCommand(command.name).then(c => {
                        c.calls.updateToday(1);
                        if (success)
                            c.executions.updateToday(1);
                    });
                }
                const cmes = (text, type, desc, settings) => this.cmes(mes.channel, mes.author, text, type, desc, settings);
                const event = { message: mes, sudo: sudo, label: cmd };
                const res = command.execute(mes.channel, mes.author, args, event, cmes);
                if (res['then']) {
                    res.then(update).catch(() => { });
                }
                else {
                    update(res);
                }
                this.cooldown.get(command.name).push(mes.author.id);
                setTimeout(id => this.cooldown.get(command.name).splice(this.cooldown.get(command.name).indexOf(id), 1), command.cooldown * 1000, mes.author.id);
            }
            else if (sudo) {
                this.cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
            }
        });
    }
    onBotReady() {
    }
    onDisable() {
    }
    loadCommands() {
        this.commands = [];
        this.identifierMap = new Map();
        const unavailableCommand = new _unavailable_1.default(this.lang);
        this.commands.push(unavailableCommand);
        this.cooldown.set(unavailableCommand.name, []);
        database_1.default
            .collection('settings')
            .findOne({ _id: 'commands' })
            .then(obj => {
            wcp_1.default.send({ config_commands: JSON.stringify(obj.data) });
            for (const commandName in obj.data) {
                try {
                    const CmdClass = require(`../commands/${commandName}`).default;
                    let cmd = new CmdClass(this.lang);
                    if (obj.data[commandName]) {
                        cmd.init();
                        this.commands.push(cmd);
                        this.cooldown.set(cmd.name, []);
                    }
                    for (const identifier of [cmd.name, ...cmd.aliases]) {
                        if (this.identifierMap.has(identifier))
                            console.log(chalk.red(`Command "${identifier}" is declared multiple times!`));
                        else
                            this.identifierMap.set(identifier, obj.data[commandName] ? cmd : unavailableCommand);
                    }
                }
                catch (err) {
                    console.error(`Class for command "${commandName}" not found!`);
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