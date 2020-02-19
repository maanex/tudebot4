import { TudeBot } from "index";
import { GuildMember, Message, Emoji, Channel, User, TextChannel } from "discord.js";
import { modlogType, cmesType, cmes } from "types";
import { DbStats } from "../database/dbstats";
import Database from "../database/database";
import WCP from "../thirdparty/wcp/wcp";
import * as chalk from "chalk";
import { Module } from "../types";


export default class CommandsModule extends Module {

  private readonly ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60_000;

  private commands: Command[] = [];

  private activeInCommandsChannel: string[] = [];
  private activeInCommandsChannelRemoveTimer = {};

  constructor(bot: TudeBot, conf: any, data: any, lang: (string) => string) {
    super('Commands', 'private', bot, conf, data, lang);
  }

  public onEnable(): void {
    this.loadCommands();

    this.bot.on('message', (mes: Message) => {
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

      this.updateActiveInCommandsChannel(mes.author.id);

      let txt = mes.content;
      let args = txt.split(' ');
      let cmd = args.splice(0, 1)[0].toLowerCase();

      let sudo = false;
      if (cmd === 'sudo' || cmd.charAt(0) == '$') {
        sudo = true;
        if (cmd.charAt(0) == '$') {
          cmd = cmd.substring(1);
          if (!cmd) return;
        } else {
          cmd = args.splice(0, 1)[0].toLowerCase();
          if (!cmd) {
            this.cmes(mes.channel, mes.author, '`sudo <command> [args..]`')
            return;
          }
        }
      }

      let command: Command;
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
        DbStats.getCommand(command.name).then(c => {
          c.calls.updateToday(1);
          if (success['then']) {
            success.then(bool => {
              if (bool)
                c.executions.updateToday(1);
            }).catch();
          } else if (success) c.executions.updateToday(1);
        });
      } else if (sudo) this.cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  private loadCommands() {
    this.commands = [];
    Database
      .collection('settings')
      .findOne({ _id: 'commands' })
      .then(obj => {
        WCP.send({ config_commands: JSON.stringify(obj.data) });
        let allCmdaliases = [];
        for (let c in obj.data)
          if (obj.data[c]) {
            let cmd = require(`../commands/${c}`);
            if (cmd.init) cmd.init(this.bot);
            this.commands.push(cmd);
            for (let a of [cmd.name, ...cmd.aliases]) {
              if (allCmdaliases.indexOf(a) >= 0) console.log(chalk.red(`Command "${a}" is declared multiple times!`));
              else allCmdaliases.push(a);
            }
          }
      })
      .catch(console.error)
  }

  public getCommands(): Command[] {
    return this.commands;
  }

  public getActiveInCommandsChannel(): string[] {
    return this.activeInCommandsChannel;
  }

  private cmes(channel: Channel, author: User, text: string, type?: cmesType, description?: string, settings?: any) {
    if (type == 'error') text = ':x: ' + text;
    // if (type == 'bad') text = ':frowning: ' + text;
    if (type == 'success') text = ':white_check_mark: ' + text;
    (channel as TextChannel).send({
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

  private updateActiveInCommandsChannel(id: string) {
    if (!this.activeInCommandsChannel.includes(id)) {
      this.activeInCommandsChannel.push(id);
      this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
        this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
        delete this.activeInCommandsChannelRemoveTimer[id];
      }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    } else {
      clearTimeout(this.activeInCommandsChannelRemoveTimer[id]);
      this.activeInCommandsChannelRemoveTimer[id] = setTimeout(() => {
        this.activeInCommandsChannel.splice(this.activeInCommandsChannel.indexOf(id));
        delete this.activeInCommandsChannelRemoveTimer[id];
      }, this.ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN);
    }
  }
}

export interface Command {
  name: string;
  aliases: string[];
  desc: string;
  sudoonly: boolean;
  hideonhelp: boolean;
  execute: Function;
}