import { Message, Channel, User, TextChannel, Emoji, Attachment, RichEmbed } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";
import Emojis from "../int/emojis";
import * as Jimp from 'jimp';
import { TudeBot } from "../index";


export default class WantedCommand extends Command {

  constructor() {
    super({
      name: 'wanted',
      description: 'I want you',
      groups: [ 'fun', 'images' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (event.message.mentions.members.size)
      user = event.message.mentions.members.first().user;
    return new Promise(async (resolve, reject) => {
      try {
        const imgBuffer = await TudeBot.badoszApi.getWanted(user.avatarURL);
        const file = new Attachment(imgBuffer, 'wanted.png');
        const embed = new RichEmbed()
          .attachFile(file)
          .setColor(0x2f3136)
          .setFooter(`@${user.tag} • api.badosz.com`)
          .setImage('attachment://wanted.png');
        channel.send('', { embed });
        resolve(true);
      } catch (ex) {
        resolve(false);
      }
    });
  }

}
