import { Message, Channel, User, TextChannel, Emoji } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import Emojis from "../int/emojis";


export default class ShipCommand extends Command {

  constructor() {
    super({
      name: 'ship',
      description: 'Ship two people!',
      groups: [ 'fun', 'rng' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (args.length < 2) {
      repl('You need to give me two people to ship!', 'bad');
      return false;
    }

    let name1 = args[0];
    let name2 = args[1];

    if (event.message.mentions.users.size >= 1) {
      name1 = event.message.mentions.users.first().username;
      if (event.message.mentions.users.size >= 2)
        name2 = event.message.mentions.users.array()[1].username;
    }

    name1 = name1.toLowerCase();
    name2 = name2.toLowerCase();

    if (name1 == name2) {
      repl('Approve', 'message', Emojis.BIG_SPACE, { image: 'https://cdn.discordapp.com/attachments/655354019631333397/682339526802538559/unknown.png' });
      return false;
    }

    if (name1.length > name2.length) {
      let temp = name1;
      name1 = name2;
      name2 = temp;
    }

    let match = '';
    out: for (let checklength = name1.length; checklength > 0; checklength--) {
      for (let index = 0; index <= (name1.length - checklength); index++) {
        let check = name1.substr(index, checklength);
        if (name2.includes(check)) {
          match = check;
          break out;
        }
      }
    }
    
    let shipName = '';
    let chances = 0;

    if (match) {
      const option1 = name1.split(match)[0] + match + name2.split(match)[1];
      const option2 = name2.split(match)[0] + match + name1.split(match)[1];
      const option1poor = option1.startsWith(match) || option1.endsWith(match);
      const option2poor = option2.startsWith(match) || option2.endsWith(match);
      if (option1poor && !option2poor) shipName = option2;
      else if (option2poor && !option1poor) shipName = option1;
      else if (option1poor && option2poor) shipName = option1;
      else {
        const optimumLength = (name1.length + name2.length) / 2;
        const option1delta = Math.abs(option1.length - optimumLength);
        const option2delta = Math.abs(option2.length - optimumLength);
        if (option1delta < option2delta) shipName = option1;
        else shipName = option2;
      }

      let same = 0;
      let one = 0;
      for (let letter of ('abcdefghijklmnoqrstuvwxyz').split('')) {
        if (name1.includes(letter)) {
          if (name2.includes(letter)) same++;
          one++;
        } else if (name2.includes(letter)) one++;
      }

      chances = (one - same) / name2.length;
      chances = Math.abs(Math.round(chances * 100));
      while (chances > 100) chances -= 100;
    }

    let heart = '';
    if (chances == 100) heart = '💖';
    else if (chances == 0) heart = '🖤';
    else if (chances >= 50) heart = '❤️';
    else heart = '💔';

    const line1 = `${this.capitalize(name1)} ${heart} ${this.capitalize(name2)}`;
    const line2 = shipName
      ? `👉 __${this.capitalize(shipName)}__ ${Emojis.BIG_SPACE} ${chances}%`
      : 'Really really bad connection between these two!';
    
    repl(line1, 'message', line2);
    return true;
  }

  private capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  }

}
