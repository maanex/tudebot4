import { modlogType } from 'types';

import { Client, Guild, User } from "discord.js";
const chalk = require('chalk');

const settings = require('../config/settings.json');


export class TudeBot extends Client {

  modules: string[];
  modlog: ModLog;
  m: any = {};

  constructor(props) {
    super(props);

    this.modules = [
      'modlog',
      'quotes',
      'counting',
      'selfroles',
      'commands',
      'happybirthday',
      'thebrain',
    ];

    fixReactionEvent(this);

    let lang = key => {
      let res = require(`../config/lang.json`)[key];
      if (!res) return '';
      if (res.length !== undefined) return res[Math.floor(Math.random() * res.length)];
      return res;
    }

    this.modules.forEach(mod => {
      this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], require(`../config/moduledata/${mod}.json`), lang);
    });

    this.on('ready', () => console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag))); 

    this.login(settings.bot.token);
  }

}

const Core = new TudeBot (
  {
    disabledEvents: [
      'TYPING_START',
    ]
  }
);


function fixReactionEvent(bot: TudeBot) {
  const events = {
      MESSAGE_REACTION_ADD: 'messageReactionAdd',
      MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  }

  bot.on('raw', async (event: Event) => {
      const ev: any = event;
      if (!events.hasOwnProperty(ev.t)) return
      const data = ev.d;
      const user: User = bot.users.get(data.user_id);
      const channel: any = bot.channels.get(data.channel_id) || await user.createDM();
      if (channel.messages.has(data.message_id)) return;
      const message = await channel.fetchMessage(data.message_id);
      const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
      const reaction = message.reactions.get(emojiKey);
      bot.emit(events[ev.t], reaction, user);
  });
}


/* */

interface ModLog {
  log: (guild: Guild, type: modlogType, text: string) => void
}