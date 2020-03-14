import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class RandomImageCommand extends Command {

  constructor() {
    super({
      name: 'image',
      aliases: [ 'randomimage', 'random', 'rndimg' ],
      description: 'A completely random image',
      groups: [ 'fun', 'images' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch('http://pd.tude.ga/imgdb.json')
        .then(o => o.json())
        .then(o => channel.send({
          embed: {
            color: 0x2f3136,
            description: args.length ? 'You cannot search for an image. This command shows a random image the bot has found somewhere on the world wide web!' : '',
            image: {
              url: o[Math.floor(Math.random() * o.length)]
            },
            footer: {
              text: user.username,
              icon_url: user.avatarURL
            }
          }
        }) && resolve(true))
        .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
