import { TudeBot } from "../index";
import { Message, TextChannel, Guild, GuildMember, User, MessageReaction } from "discord.js";
import TudeApi, { ClubUser } from "../thirdparty/tudeapi/tudeapi";
import { Module } from "../types";


export default class QuotesModule extends Module {

  private readonly UPDATE_COOLDOWN = 2 * 60_000;
  private readonly UPDATE_EMOJI = '🔄';

  private interval: NodeJS.Timeout;

  private channels: TextChannel[] = [];
  

  constructor(conf: any, data: any, lang: (string) => string) {
    super('Module Name', 'private', conf, data, lang);
  }

  public onEnable(): void {
    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      let mes = reaction.message;
      if (user.bot) return;
      if (!mes.guild) return;
      if (!this.conf.channels.includes(`${mes.guild.id}/${mes.channel.id}`)) return;

      if (reaction.emoji.name == this.UPDATE_EMOJI)
        this.update(mes.channel as TextChannel);
    });
  }

  public onBotReady(): void {
    for (let path of this.conf.channels) {
      let guildid = path.split('/')[0];
      let channelid = path.split('/')[1];
      if (!guildid || !channelid) return;
      let guild = TudeBot.guilds.get(guildid);
      if (!guild) return;
      let channel = guild.channels.get(channelid);
      if (!channel) return;
      this.channels.push(channel as TextChannel);
    }

    let lastmin = 0;
    this.interval = setInterval(() => {
      let currmin = new Date().getMinutes();
      if (currmin == lastmin) return;
      lastmin = currmin;
      if (currmin != 0) return;
      this.channels.forEach(this.update);
    }, 30_000);
    this.channels.forEach(this.update);
  }

  public onDisable(): void {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  private update(channel: TextChannel) {
    this.generateLeaderboard(channel.guild).then(content => {
      channel.fetchMessages().then(m => {
        if (m.size) {
          let mes = m.first();
          mes.edit(content);
          mes.clearReactions();
          setTimeout(() => {
            mes.react(this.UPDATE_EMOJI);
          }, this.UPDATE_COOLDOWN);
        } else {
          channel.send(content).then(mes => {
            (mes as Message).react(this.UPDATE_EMOJI);
          }).catch(err => {
            TudeBot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
          });
        }
      }).catch(err => {
        TudeBot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
      });
    }).catch(err => {
      TudeBot.modlog.log(channel.guild, 'warning', 'Leaderboard could not get updated! Error: ```' + err + '```');
    });
  }

  private generateLeaderboard(guild: Guild): Promise<string> {
    return new Promise((resolve, reject) => {
      TudeApi.clubLeaderboard().then(leaderboard => {
        let out = `   | All Time           | This Month\n---+--------------------+-------------------`;

        let at: ClubUser, tm: ClubUser, ats: string, tms: string, u: GuildMember, pm: string;
        for (let i = 0; i < 10; i++) {
          at = leaderboard.alltime[i];
          u = at ? guild.members.get(at.user['accounts'].discord) : null;
          if (at) ats = `${u ? u.user.username : at.user.name}..............`.slice(0, 13) + `..lv${at.level}`.slice(-5);
          else ats = '                  ';

          tm = leaderboard.month[i];
          u = tm ? guild.members.get(tm.user['accounts'].discord) : null;
          if (tm) {
            if (tm.points_month > 1000) {
              let smol = Math.floor(tm.points_month / 100);
              if (smol > 99) {
                smol = Math.floor(tm.points_month / 10);
                pm = smol + 'k';
              } else {
                pm = `${smol}`.charAt(0) + '.' + `${smol}`.charAt(1) + 'k';
              }
            } else pm = tm.points_month + '';
            tms = `${u ? u.user.username : tm.user.name}..............`.slice(0, 13) + `......${pm}`.slice(-5);
          } else tms = '                  ';

          out += `\n${((i + 1) + '. ').slice(0, 3)}| ${ats} | ${tms}`;
        }
        out += `\nLast Update: ${new Date(leaderboard.updated)}`;
        if (new Date().getHours() == 0) { // Whale fact time
          out += '``` ```fix\nWhale fact of the day: ';
          let facts: string[] = this.data.whalefacts;
          out += facts[new Date().getDate() % facts.length];
        }
        resolve('```cs\n' + out + '```');
      }).catch(reject);
    });
  }
}
