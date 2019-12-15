import { TudeBot } from "index";
import { GuildMember, Message, Emoji, Channel, User, TextChannel } from "discord.js";
import { modlogType, cmesType } from "types";
const util = require('../util');

let commands: Command[] = [];
for (let c of [
    'botinfo',
    'catimg',
    'dogimg',
    'jokes',
    'eval',
    'wubbalubba',
    'freestuff',
    'inspiration',
    'stats',
    'uinfo',
    'roulette',
    'reload',
]) commands.push(require(`../commands/${c}`));

export let activeInCommandsChannel: string[] = [];
let activeInCommandsChannelRemoveTimer = {};
const ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60_000;

module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    
    bot.on('message', (mes: Message) => {
        if (mes.author.bot) return;
        if (!mes.guild) return;
        if (!conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

        updateActiveInCommandsChannel(mes.author.id);
        
        let txt = mes.content;
        let args = txt.split(' ');
        let cmd = args.splice(0, 1)[0];

        let sudo = false;
        if (cmd === 'sudo') {
            sudo = true;
            cmd = args.splice(0, 1)[0];
            if (!cmd) {
                cmes(mes.channel, mes.author, '`sudo <command> [args..]`')
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

        if (sudo) cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
    });

}

function cmes(channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) {
    if (type == 'error') text = ':x: ' + text;
    if (type == 'bad') text = ':frowning: ' + text;
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

interface Command {
    name: string;
    aliases: string[];
    desc: string[];
    sudoonly: boolean;
    execute: Function;
}