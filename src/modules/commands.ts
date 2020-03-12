import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, Channel, User, TextChannel } from "discord.js";
import { modlogType, cmesType, cmes, Command, ReplyFunction } from "types";
import { DbStats } from "../database/dbstats";
import Database from "../database/database";
import WCP from "../thirdparty/wcp/wcp";
import * as chalk from "chalk";
import { Module } from "../types";
import UnavailableCommand from "../commands/_unavailable";


export default class CommandsModule extends Module {

  private readonly ACTIVE_IN_COMMANDS_CHANNEL_COOLDOWN = 2 * 60_000;

  private activeInCommandsChannel: string[] = [];
  private activeInCommandsChannelRemoveTimer = {};
  
  private commands: Command[] = [];
  private identifierMap: Map<string, Command> = new Map();

  private cooldown: Map<string, string[]> = new Map();


  constructor(conf: any, data: any, lang: (string) => string) {
    super('Commands', 'public', conf, data, lang);
  }

  public onEnable(): void {
    this.loadCommands();

    TudeBot.on('message', (mes: Message) => {
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (mes.guild.id == "432899162150010901") DbStats.getUser(mes.author).then(u => u.messagesSent++); // TODO MAKE BETTER
      if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

      this.updateActiveInCommandsChannel(mes.author.id);

      const txt = mes.content;
      const args = txt.split(' ');
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

        function update(success: boolean) {
          DbStats.getCommand(command.name).then(c => {
            c.calls.updateToday(1);
            if (success) c.executions.updateToday(1);
          });
        }

        const cmes: ReplyFunction = (text: string, type?: cmesType, desc?: string, settings?: any) => this.cmes(mes.channel, mes.author, text, type, desc, settings);
        const event = { message: mes, sudo: sudo, label: cmd };
        const res = command.execute(mes.channel as TextChannel, mes.author, args, event, cmes);

        if (res === undefined || res === null) {
          update(false);
        } else if (res['then']) {
          (res as Promise<boolean>).then(update).catch(() => {});
        } else {
          update(res as boolean);
        }

        this.cooldown.get(command.name).push(mes.author.id);
        setTimeout(id => this.cooldown.get(command.name).splice(this.cooldown.get(command.name).indexOf(id), 1), command.cooldown * 1000, mes.author.id);
      } else if (sudo) {
        this.cmes(mes.channel, mes.author, 'Command `' + cmd + '` not found!');
      }
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  private loadCommands() {
    this.commands = [];
    this.identifierMap = new Map();

    const unavailableCommand = new UnavailableCommand(this.lang);
    this.commands.push(unavailableCommand);
    this.cooldown.set(unavailableCommand.name, []);
    Database
      .collection('settings')
      .findOne({ _id: 'commands' })
      .then(obj => {
        WCP.send({ config_commands: JSON.stringify(obj.data) });

        for (const commandName in obj.data) {
          try {
            const CmdClass = require(`../commands/${commandName}`).default;
            let cmd: Command = new CmdClass(this.lang);

            if (obj.data[commandName]) {
              cmd.init();
              this.commands.push(cmd);
              this.cooldown.set(cmd.name, []);
            }

            for (const identifier of [cmd.name, ...cmd.aliases]) {
              if (this.identifierMap.has(identifier)) console.log(chalk.red(`Command "${identifier}" is declared multiple times!`));
              else this.identifierMap.set(identifier, obj.data[commandName] ? cmd : unavailableCommand);
            }
          } catch(err) {
            console.error(`Class for command "${commandName}" not found!`);
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