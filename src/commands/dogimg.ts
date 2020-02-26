import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class DogCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'dog',
      [ 'doggo',
        'dogimage',
        'dogimg' ],
      'A random dog image',
      0,
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch('https://api.thedogapi.com/v1/images/search?format=json')
        .then(o => o.json())
        .then(o => channel.send({
          embed: {
            color: 0x2f3136,
            image: {
              url: o[0].url
            },
            footer: {
              text: user.username,
              icon_url: user.avatarURL
            }
          }
        }) && resolve(true))
        .catch(err => { repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
