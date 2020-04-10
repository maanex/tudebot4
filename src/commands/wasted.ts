import { Message, Channel, User, TextChannel, Emoji, Attachment, RichEmbed } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import Emojis from "../int/emojis";
import * as Jimp from 'jimp';
import { TudeBot } from "../index";


export default class WastedCommand extends Command {

  constructor() {
    super({
      name: 'wasted',
      description: 'F in the chat',
      groups: [ 'fun', 'images' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (event.message.mentions.members.size)
      user = event.message.mentions.members.first().user;
    return new Promise(async (resolve, reject) => {
      try {
        const imgBuffer = await TudeBot.badoszApi.getWasted(user.avatarURL);
        const file = new Attachment(imgBuffer, 'wasted.png');
        const embed = new RichEmbed()
          .attachFile(file)
          .setColor(0x2f3136)
          .setImage('attachment://wasted.png');
        channel.send('', { embed });
        resolve(true);
      } catch (ex) {
        resolve(false);
      }
    });
  }

}
