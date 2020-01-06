import { TudeBot } from "index";
import { GuildMember, Message, Emoji, Channel, User, TextChannel } from "discord.js";
import { modlogType, cmesType } from "types";
import { DbStats } from "../database/dbstats";
import Database from "../database/database";
const util = require('../util');

let commands: Command[] = [];

let activeInCommandsChannel: string[] = [];
let activeInCommandsChannelRemoveTimer = {};
const ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60_000;

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {

    function loadCommands() {
        Database
            .collection('settings')
            .findOne({ _id: 'commands' })
            .then(obj => {
                for (let c in obj.data)
                    if (obj.data[c])
                        commands.push(require(`../commands/${c}`));
            })
            .catch(console.error)
    }
    loadCommands();
    
    bot.on('message', (mes: Message) => {
        if (mes.author.bot) return;
        if (!mes.guild) return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

        updateActiveInCommandsChannel(mes.author.id);
        
        let txt = mes.content;
        let args = txt.split(' ');
        let cmd = args.splice(0, 1)[0].toLowerCase();

        let sudo = false;
        if (cmd === 'sudo') {
            sudo = true;
            cmd = args.splice(0, 1)[0].toLowerCase();
            if (!cmd) {
                cmes(mes.channel, mes.author, '`sudo <command> [args..]`')
                return;
            }
        }

        let command: Command;
        out: for (let c of commands) {
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
            DbStats.getCommand(command.name).then(c => {
                c.calls.updateToday(1);
                if (success['then']) {
                    success.then(bool => {
                        if (bool)
                            c.executions.updateToday(1);
                    }).catch();
                } else if (success) c.executions.updateToday(1);
            });
        } else if (sudo) cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
    });

    return {
        getCommands() {
            return commands;
        },
        getActiveInCommandsChannel() {
            return activeInCommandsChannel;
        }
    }
}

function cmes(channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) {
    if (type == 'error') text = ':x: ' + text;
    if (type == 'bad') text = ':frowning: ' + text;
    if (type == 'success') text = ':white_check_mark: ' + text;
    (channel as TextChannel).send({
        embed: {
            color: 0x36393f,
            title: description?`${text}`:'',
            description: description?`${description||''}`:`${text}`,
            footer: {
                text: '@' + author.username,
                // icon_url: author.avatarURL
            },
            thumbnail: { url: settings && settings.image },
            image: { url: settings && settings.banner }
        }
    });
}

function updateActiveInCommandsChannel(id: string) {
    if (!activeInCommandsChannel.includes(id)) {
        activeInCommandsChannel.push(id);
        activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
            activeInCommandsChannel.splice(activeInCommandsChannel.indexOf(id));
            delete activeInCommandsChannelRemoveTimer[id];
        }, ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    } else {
        clearTimeout(activeInCommandsChannelRemoveTimer[id]);
        activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
            activeInCommandsChannel.splice(activeInCommandsChannel.indexOf(id));
            delete activeInCommandsChannelRemoveTimer[id];
        }, ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    }
}

export interface Command {
    name: string;
    aliases: string[];
    desc: string[];
    sudoonly: boolean;
    hideonhelp: boolean;
    execute: Function;
}