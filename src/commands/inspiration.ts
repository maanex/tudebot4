import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class InspirationCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'inspiration',
      [ 'inspirational',
        'inspirobot',
        'randomquote',
        'thinkaboutit' ],
      'Random quote from inspirobot.me',
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch('http://inspirobot.me/api?generate=true')
        .then(o => o.text())
        .then(o => channel.send({
          embed: {
            color: 0x2f3136,
            image: {
              url: o
            },
            footer: {
              text: `${user.username} • inspirobot.me`,
              icon_url: user.avatarURL
            }
          }
        }) && resolve(true))
        .catch(err => { repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
