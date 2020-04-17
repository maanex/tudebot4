import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi, { ClubUser } from "../thirdparty/tudeapi/tudeapi";
import Emojis from "../int/emojis";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import ParseArgs from "../util/parseArgs";
import Database from "../database/database";
import * as Items from "../content/itemlist";
import GetPointsModule from "modules/getpoints";


export default class AdminCommand extends Command {

  constructor() {
    super({
      name: 'admin',
      description: 'Admin',
      groups: [ 'internal' ],
      sudoOnly: true,
    });
  }

  public execute(orgChannel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false;

    try {
      if (args.length == 0) {
        repl('admin <cmd>', 'bad', ([
          'setupchannelgames <channel>',
          'itemlist',
          'setupitemshop <channel>',
          'resetdaily <user> [-c --clearstreak]',
          'testmodlog',
          'testlevelupreward'
        ]).map(cmd => `• ${cmd}`).join('\n'));
        return false;
      }

      let run: () => {} = undefined;
      let cmdl = ParseArgs.parse(args);
      switch (args[0]) {
        case 'setupchannelgames':
          run = async () => {
            let channel = orgChannel.guild.channels.get(args[1]) as TextChannel;
            await channel.send({ embed: { title: "I'm on top of the world!", url: 'https://www.youtube.com/watch?v=w5tWYmIOWGk' } });
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE);
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE);
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE);
            let lakeIds = [];
            for (let i = 0; i < 11; i++)
              // @ts-ignore
              await channel.send('<the lake>').then(m => lakeIds.push(m.id));
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE);
            let mineIds = [];
            for (let i = 0; i < 11; i++)
              // @ts-ignore
              await channel.send('<mineshaft>').then(m => mineIds.push(m.id));
            await channel.send(Emojis.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + Emojis.BIG_SPACE);
            await channel.send({
              embed: {
                title: 'Available Games:',
                color: 0x00b0f4,
                description: `[The Lake](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${lakeIds[0]})\n[Mineshaft](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${mineIds[0]})\n`,
                footer: {
                  text: 'Click on a game\'s name to jump to it'
                }
              }
            });
            repl('Success!', 'success', `Lake:\n"${lakeIds.join('","')}"\n\nMine:\n"${mineIds.join('","')}"`);
          }; run();
          break;

        case 'setupitemshop':
          run = async () => {
            let channel = orgChannel.guild.channels.get(args[1]) as TextChannel;
            for (let i = 0; i < 20; i++)
              await channel.send(Emojis.BIG_SPACE);
            repl('Success!', 'success');
          }; run();
          break;

        case 'itemlist':
          // repl('Items:', 'success', Items.itemIdMap.map(i => i.id).join('\n')); TODO ITEMS
          break;

        case 'resetdaily':
          if (args.length < 2) {
            repl('user?');
            return;
          }

          run = async () => {
            const user = await (event.message.mentions.users.size
              ? TudeApi.userByDiscordId(event.message.mentions.users.first().id)
              : TudeApi.userById(args[1]));

            const clearStreak = cmdl.c || cmdl.clearstreak;
            
            const update = clearStreak
              ? { '$set': { 'daily.last': 0 } }
              : { '$inc': { 'daily.last': -1 } };

            Database
              .get('tudeclub')
              .collection('users')
              .updateOne({ _id: user.id }, update);

            repl('Yes sir!');
          }; run();
          break;

        case 'testmodlog':
          TudeBot.modlog(orgChannel.guild, 'message', args.join(' '));
          break;

        case 'testlevelupreward':
          if (args.length < 2 || isNaN(parseInt(args[1]))) {
            repl('level?');
            return false;
          }
          const module = TudeBot.modules.get('getpoints') as GetPointsModule;
          module.assignLevelRoles(event.message.member, {level:parseInt(args[1])} as ClubUser);
          break;

        case 'testperks':
          TudeApi.clubUserByDiscordId(user.id, user).then(u => {
            TudeApi.performClubUserAction(u, { id: 'obtain_perks', perks: 'club.cookies:[100-200]' }).then(console.log).catch(console.error);
          });
          break;
      }
      return true;
    } catch (ex) {
      repl('Error:', 'bad', '```' + ex + '```');
      return false;
    }
  }

}
