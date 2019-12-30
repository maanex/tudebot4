import { modlogType } from 'types';

import { Client, Guild, User } from "discord.js";
import TudeApi from './thirdparty/tudeapi/tudeapi';
import WCP from './thirdparty/wcp/wcp';
import * as fs from 'fs';
import Database from './database/database';
import MongoAdapter from './database/mongo.adapter';
import { DbStats } from './database/dbstats';
const chalk = require('chalk');

const settings = require('../config/settings.json');


export class TudeBot extends Client {

  public modules: string[];
  public modlog: ModLog;
  public m: any = {};

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
      'memes',
      'autoleaderboard',
      'getpoints',
    ];

    fixReactionEvent(this);
    
    WCP.init();

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(() => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        TudeApi.init();
        Database.init();
    
        let lang = key => {
          let res = require(`../config/lang.json`)[key];
          if (!res) return '';
          if (res.length !== undefined) return res[Math.floor(Math.random() * res.length)];
          return res;
        }
    
        this.modules.forEach(mod => {
          let moddata = {};
          try { moddata = require(`../config/moduledata/${mod}.json`); }
          catch (ex) { }
          this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], moddata, lang);
        });
    
        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
        });
    
        this.login(settings.bot.token);
      });
  }

}


export const Core = new TudeBot (
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