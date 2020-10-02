import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import Emojis from "../int/emojis";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import * as md5 from "../util/md5";
import { ProfileSkin } from "../content/profileskins";


export default class ProfileCommand extends Command {

  constructor() {
    super({
      name: 'profile',
      aliases: [ 'p' ],
      description: 'See your profile (or someone elses)',
      cooldown: 5,
      groups: [ 'club' ],
    });
  }

  public execute(channel: TextChannel, orgUser: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let user = orgUser;
      if (event.message.mentions.users.size)
        user = event.message.mentions.users.first();
      TudeApi.clubUserByDiscordId(user.id, user)
        .then(u => {
          if (!u || u.error) {
            repl('User not found!', 'message', 'Or internal error, idk');
            resolve(false);
            return;
          }

          const profileSkin = ProfileSkin.DEFAULT;
          const emblemsUsed = Emojis.PROFILE_EMBLEMS[profileSkin.emblemSet];

          let footer = `${u.points}pt`;
          let icon = undefined;
          let xpbar = '';
          let stats = `${Emojis.BIG_SPACE}`;
          let statItems = [`${emblemsUsed.COOKIES} ${u.cookies}`, `${emblemsUsed.GEMS} ${u.gems}`];
          if (u.keys > 0) statItems.push(`${emblemsUsed.KEYS} ${u.keys}`);
          // @ts-ignore
          if (u.inventory.size > 0) {
            let amount = 0;
            for (let item of u.inventory.values())
              amount += item.amount;
            statItems.push(`${emblemsUsed.ITEMS} ${amount}`);
          }
          if (u.daily.streak >= 7) {
            statItems.push(`${emblemsUsed.STREAK} ${u.daily.streak}`);
          }

          let c = 0;
          for (let si of statItems)
            stats += (c++ % 3 == 0 ? '\n\n' : ` ${Emojis.BIG_SPACE} `) + si;

          if (u.daily.claimable && !event.message.mentions.users.size)
            stats += '\n\n**You haven\'t claimed\nyour daily reward yet!**';

          let prog12 = Math.floor(u.level_progress * 12);
          if (prog12 == 0) xpbar += Emojis.PROFILE_BARS.DEFAULT.LEFT_EMPTY;
          else if (prog12 == 1) xpbar += Emojis.PROFILE_BARS.DEFAULT.LEFT_HALF;
          else xpbar += Emojis.PROFILE_BARS.DEFAULT.LEFT_FULL;
          for (let i = 1; i <= 4; i++) {
            let relative = prog12 - i * 2;
            if (relative < 0) xpbar += Emojis.PROFILE_BARS.DEFAULT.MIDDLE_EMPTY;
            else if (relative == 0) xpbar += Emojis.PROFILE_BARS.DEFAULT.MIDDLE_1;
            else if (relative == 1) xpbar += Emojis.PROFILE_BARS.DEFAULT.MIDDLE_2;
            else xpbar += Emojis.PROFILE_BARS.DEFAULT.MIDDLE_3;
          }
          if (prog12 >= 11) xpbar += Emojis.PROFILE_BARS.DEFAULT.RIGHT_FULL;
          else if (prog12 == 10) xpbar += Emojis.PROFILE_BARS.DEFAULT.RIGHT_HALF;
          else xpbar += Emojis.PROFILE_BARS.DEFAULT.RIGHT_EMPTY;

          xpbar += ` **${Math.floor(u.level_progress * 100)}%**`;

          if (u.profile && u.profile.disp_badge) {
            let badge = TudeApi.badgeById(u.profile.disp_badge);
            let appearance = badge.appearance[0];
            for (let a of badge.appearance) {
              if (a.from <= u.badges[u.profile.disp_badge])
                appearance = a;
              else break;
            }
            footer += ' • ' + appearance.name;
            icon = appearance.icon;
            // icon = 'https://cdn.discordapp.com/attachments/543150321686413313/675367430641680384/guy.png';
          }
          let badges: string[] = [];
          if (u.badges) {
            for (let b of Object.keys(u.badges)) {
              let badge = TudeApi.badgeById(parseInt(b));
              let appearance = badge.getAppearance(u.badges[b]);
              badges.push(appearance.emoji);
            }
          }

          let uname = user.username.split('•').join('');
          let uicon = user.avatarURL;
          if (u.user.type == 1) {
            uname = u.user.name;
            // uicon = `https://www.gravatar.com/avatar/${md5.hash(u.user.email)}?s=60&d=identicon`;
            if (u.user.tag == 0) {
              // uname += ' ✔️';
              uname += ' •';
            }
          }

          channel.send({
            embed: {
              author: {
                name: uname,
                icon_url: uicon
              },
              color: 0x2f3136,
              footer: { text: footer },
              thumbnail: { url: icon },
              description: badges.join(' ') + '```fix\nLevel ' + u.level + '```',
              fields: [
                {
                  name: xpbar,
                  value: stats
                }
              ]
            }
          });
          resolve(true);
        })
        .catch(err => {
          repl('An error occured!', 'bad');
          console.error(err);
          resolve(false);
        });
    });
  }

}