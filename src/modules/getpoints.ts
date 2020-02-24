import { TudeBot } from '..';
import { Message, MessageReaction, User as DiscordUser, Guild, VoiceChannel, GuildMember } from 'discord.js';
import * as cron from 'cron';
import TudeApi, { User, ClubUser } from '../thirdparty/tudeapi/tudeapi';
import { Module } from "../types";


export type rewardReason = 'MessageSent' | 'MessageReaction' | 'MessageEngagement';
export type punishmentReason = 'MessageDelete' | 'MessageSpam' | 'ReactionRemove' | 'ReactionSpam';

export default class GetPointsModule extends Module {

  private readonly max_regenValue = 20;
  private readonly max_totalValue = 30;

  private pointBags: { [id: string]: number } = {};
  private messagesSentLast5Sec: { [id: string]: number } = {};
  private reactionsAddedLast5Sec: { [id: string]: number } = {};

  private cronjobs: cron.CronJob[] = [];

  
  constructor(conf: any, data: any, lang: (string) => string) {
    super('Module Name', 'private', conf, data, lang);
  }

  public onEnable(): void {
    TudeBot.on('message', mes => {
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (!this.conf.guilds.includes(mes.guild.id)) return;

      let messcont = mes.content;
      // // NOTHING WRONG WITH THIS CODE, JUST DISABLED, PERFORMANCE WISE - NOTHING WRONG WITH PERFORMANCE EITHER, MORE LIKE... A BIT OVERKILL AT THIS POINT, HUH?
      // let letters = [];
      // for (let letter of messcont.split(''))
      //     if (letters.indexOf(letter) < 0) letters.push(letter);
      // for (let letter of letters)
      //     messcont = messcont.split(new RegExp(letter + '+')).join(letter);

      let quality = 1;
      let messageLengthFactor = x => Math.max((-1 / x) * (x - 40) * (x - 40) / 1000 + .5, 0);
      let messagesLast5SecFactor = 1 / (this.messagesSentLast5Sec[mes.author.id] || 1);
      quality *= messageLengthFactor((messcont.length * 2 + mes.content.length) / 3);
      quality *= messagesLast5SecFactor;

      TudeApi.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageSent', quality * 2)).catch(ex => { });

      if (this.messagesSentLast5Sec[mes.author.id])
        this.messagesSentLast5Sec[mes.author.id]++;
      else this.messagesSentLast5Sec[mes.author.id] = 1;
      setTimeout(() => {
        if (--this.messagesSentLast5Sec[mes.author.id] <= 0)
          delete this.messagesSentLast5Sec[mes.author.id];
      }, 5_000);
      if (this.messagesSentLast5Sec[mes.author.id] > 4) this.punish(mes.author, 'MessageSpam');

      // this.reward previous message
      if (mes.channel.lastMessage.author.id == mes.author.id) return;
      if (mes.channel.lastMessage.createdTimestamp - Date.now() < 1000 * 10) return;
      if (this.messagesSentLast5Sec[mes.author.id] > 1) return;
      TudeApi.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageEngagement', .5)).catch(ex => { });
    });

    TudeBot.on('messageDelete', mes => {
      if (mes.author.bot) return;
      if (!mes.guild) return;
      if (!this.conf.guilds.includes(mes.guild.id)) return;

      if (this.reactionsAddedLast5Sec[mes.author.id] > 6) this.punish(mes.author, 'MessageDelete');
    });

    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: DiscordUser) => {
      let mes = reaction.message;
      if (user.bot) return;
      if (!mes.guild) return;
      if (!this.conf.guilds.includes(mes.guild.id)) return;

      let quality = 1;
      if (reaction.count == 1) quality = 1.2;
      quality /= (this.reactionsAddedLast5Sec[mes.author.id] || 1);
      TudeApi.clubUserByDiscordId(user.id).then(u => this.reward(u, 'MessageReaction', quality)).catch(ex => { });

      if (this.reactionsAddedLast5Sec[mes.author.id])
        this.reactionsAddedLast5Sec[mes.author.id]++;
      else this.reactionsAddedLast5Sec[mes.author.id] = 1;
      setTimeout(() => {
        if (--this.reactionsAddedLast5Sec[mes.author.id] <= 0)
          delete this.reactionsAddedLast5Sec[mes.author.id];
      }, 5_000);
      if (this.reactionsAddedLast5Sec[mes.author.id] > 6) this.punish(user, 'ReactionSpam');

      // if message author real user and message sent in last hour, this.reward them too
      if (mes.author.bot) return;
      if (mes.createdTimestamp - Date.now() > 1000 * 60 * 60) return;
      TudeApi.clubUserByDiscordId(mes.author.id).then(u => this.reward(u, 'MessageEngagement')).catch(ex => { });
    });

    TudeBot.on('messageReactionRemove', (reaction: MessageReaction, user: DiscordUser) => {
      let mes = reaction.message;
      if (user.bot) return;
      if (!mes.guild) return;
      if (!this.conf.guilds.includes(mes.guild.id)) return;

      TudeApi.clubUserByDiscordId(user.id).then(u => this.punish(user, 'ReactionRemove')).catch(ex => { });
    });

    TudeBot.on('guildMemberAdd', member => {
      TudeApi.clubUserByDiscordId(member.id, member.user)
        .then(u => {
          for (let i = 1; i <= u.level; i++) {
            for (let gid in this.conf.levelthis.rewards) {
              let guild = TudeBot.guilds.get(gid);
              if (!guild) continue;
              let roleid = this.conf.levelthis.rewards[gid][i];
              if (!roleid) continue;
              member.addRole(guild.roles.find(r => r.id == roleid));
            }
          }
        })
        .catch();
    });

    //                      s m h d m dw
    this.cronjobs.push(cron.job('0 * * * * *', this.regenBags));
    this.cronjobs.push(cron.job('0 0 * * * *', this.fillBags));
    // this.cronjobs.push(cron.job('0 0 * * * *', () => checkVoice(this.conf.guilds.map(TudeBot.guilds.get))).start()); TODO error here
    this.cronjobs.forEach(j => j.start());
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
    this.cronjobs.forEach(j => j.stop());
    this.cronjobs = [];
  }

  public onUserLevelup(user: ClubUser, newLevel: number, rewards: any): void {
    if (!user.user) return;
    if (!user.user['accounts']) return;
    if (!user.user['accounts']['discord']) return;
    let duser = TudeBot.users.get(user.user['accounts']['discord']);
    if (!duser) return;
    let desc = `You are now **Level ${newLevel}**\n`;
    if (rewards.cookies) desc += `\n+${rewards.cookies} Cookies`;
    if (rewards.gems) desc += `\n+${rewards.gems} Gems`;
    if (rewards.keys) desc += `\n+${rewards.keys} Keys`;
    duser.send({
      embed: {
        color: 0x2f3136,
        title: "Ayyy, you've leveled up!",
        description: desc
      }
    });

    for (let gid in this.conf.levelthis.rewards) {
      let guild = TudeBot.guilds.get(gid);
      if (!guild) continue;
      let mem = guild.members.get(duser.id);
      if (!mem) continue;
      let roleid = this.conf.levelthis.rewards[gid][newLevel];
      if (!roleid) continue;
      mem.addRole(guild.roles.find(r => r.id == roleid));
    }
  }

  private regenBags(): void {
    for (let user in this.pointBags) {
      if (this.pointBags[user] >= this.max_regenValue) continue;
      this.pointBags[user] += Math.floor(Math.random() * 3) + 3;
    }
  }

  private fillBags(): void {
    for (let user in this.pointBags) {
      if (this.pointBags[user] < this.max_regenValue) continue;
      this.pointBags[user]++;
      if (this.pointBags[user] >= this.max_totalValue)
        delete this.pointBags[user];
    }
  }

  private checkVoice(guilds: Guild[]): void {
    for (let guild of guilds) {
      guild.channels.filter(c => c.type == 'voice').forEach(c => {
        let mems: GuildMember[] = [];
        for (let u of (c as VoiceChannel).members.array())
          if (!u.mute && !u.deaf) mems.push(u);
        if (mems.length > 1) {
          for (let m of mems)
            TudeApi.clubUserByDiscordId(m.id).then(u => {
              u.points++;
              TudeApi.updateClubUser(u);
            }).catch(ex => { });
        }
      });
    }
  }

  public reward(user: User | ClubUser, reason: rewardReason, quality: number = 1): void {
    let bag = this.pointBags[user.id];
    if (!bag) bag = (this.pointBags[user.id] = this.max_totalValue);
    if (bag <= 0) return;

    let percentage: number = { 'MessageSent': .5, 'MessageReaction': .2, 'MessageEngagement': .1 }[reason];
    percentage *= quality;

    let points = bag * percentage;
    points = Math.floor(points);
    this.pointBags[user.id] -= points;

    let fun = (u: ClubUser) => {
      u.points += points;
      if (points)
        TudeApi.updateClubUser(u);
    }

    if (user['points']) fun(user as ClubUser); // if user is clubuser, or else:
    else TudeApi.clubUserById(user.id).then(fun).catch();
  }

  public punish(user: DiscordUser, punishment: punishmentReason): void {
    let bag = this.pointBags[user.id];
    if (!bag) bag = (this.pointBags[user.id] = this.max_totalValue);

    switch (punishment) {
      case 'MessageDelete':
        if (this.pointBags[user.id] >= -10)
          this.pointBags[user.id] -= 10;
        break;
      case 'MessageSpam':
        if (this.pointBags[user.id] >= -100)
          this.pointBags[user.id] -= 3;
        break;
      case 'ReactionRemove':
        this.pointBags[user.id] *= .5;
        break;
      case 'ReactionSpam':
        if (this.pointBags[user.id] >= -10)
          this.pointBags[user.id] -= 1;
        break;
    }
  }

}