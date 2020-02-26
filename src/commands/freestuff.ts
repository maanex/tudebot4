import { TudeBot } from "../index";
import { Message, Channel, User, WebhookClient, Guild, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class FreestuffCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'freestuff',
      [ ],
      'Free stuff announcement tool',
      0,
      false,
      true,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    const perms = event.message.member.hasPermission('MANAGE_CHANNELS') || !!event.message.member.roles.find(r => r.name.split(' ').join('').toLowerCase() == 'freestuff');

    if (!perms) {
      repl(':x: Not allowed!');
      return false;
    }
    if (!args.length) {
      repl('freestuff <link>', 'bad');
      return false;
    }

    repl('Deprecated.', 'bad');
    // this.announce(channel.guild, args.join(' '));
    event.message.delete();
    return true;
  }

  public announce = (guild: Guild, text: string) => {
    // let role = guild.roles.get(roleid);
    // role.setMentionable(true).then(() =>
    //     webhook.send(`<@&${roleid}> ${text}`).then(m => {
    //         role.setMentionable(false);
    //         // @ts-ignore
    //         let mes: Message = guild.channels.get(m.channel_id).messages.get(m.id);
    //         mes.react('🆓');
    //     })
    // );
  };

}
