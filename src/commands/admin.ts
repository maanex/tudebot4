import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import Emojis from "../int/emojis";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class AdminCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'admin',
      [ ],
      'Admin',
      true,
      false,
      lang
    );
  }

  public execute(orgChannel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false;

    try {
      if (args.length == 0) {
        repl('admin <cmd>', 'bad', '• setupchannelgames <channel>\n• itemlist\n• setupitemshop <channel>');
        return false;
      }

      let run: () => {} = undefined;
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
          repl('Items:', 'success', TudeApi.items.map(i => i.id + ': ' + i.name).join('\n'));
          break;
      }
      return true;
    } catch (ex) {
      repl('Error:', 'bad', '```' + ex + '```');
      return false;
    }
  }

}
