import { Message, Channel, User, TextChannel, Emoji, Attachment, RichEmbed } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import Emojis from "../int/emojis";
import * as Jimp from 'jimp';
import { TudeBot } from "../index";


export default class JesusCommand extends Command {

  constructor() {
    super({
      name: 'jesus',
      aliases: [ 'holy', 'holy shit', 'amen', 'blessed' ],
      description: 'Our lord and saviour',
      groups: [ 'fun', 'images' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const imgBuffer = await TudeBot.badoszApi.getJesus();
        const file = new Attachment(imgBuffer, 'AMEN.png');
        const embed = new RichEmbed()
          .attachFile(file)
          .setColor(0x2f3136)
          .setFooter(`@${user.tag} • api.badosz.com`)
          .setImage('attachment://AMEN.png');
        channel.send('', { embed });
        resolve(true);
      } catch (ex) {
        resolve(false);
      }
    });
  }

}
