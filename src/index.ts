import { modlogType } from 'types';

import { Client, Guild, User } from "discord.js";
import TudeApi, { ClubUser } from './thirdparty/tudeapi/tudeapi';
import WCP from './thirdparty/wcp/wcp';
import * as fs from 'fs';
import Database from './database/database';
import MongoAdapter from './database/mongo.adapter';
import { DbStats } from './database/dbstats';
import { Util } from './util/util';
import { Command } from './modules/commands';
import { loadavg } from 'os';
import { Long } from 'mongodb';
const chalk = require('chalk');

const settings = require('../config/settings.json');


export class TudeBot extends Client {

  public modlog: ModLog;
  public m: moduledata = {};

  constructor(props) {
    super(props);

    fixReactionEvent(this);

    Util.init();
    
    WCP.init();

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(async () => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        await TudeApi.init(settings.lang);
        await Database.init();

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
        });
    
        await this.loadModules();
        this.login(settings.bot.token);
        // TODO
        // TudeApi.clubUserById('42').then(u => console.log(u.inventory))
      });
  }

  loadModules(): Promise<void> {
    return new Promise((resolve, reject) => {
      Database
        .collection('settings')
        .findOne({ _id: 'modules' })
        .then(data => {
          data = data.data;

          WCP.send({ config_modules: JSON.stringify(data) });
          
          for (let mod of Object.values(this.m)) {
            if (mod && mod['onDisable'])
              mod.onDisable();
          }
          
          this.m = {};
          this.modlog = undefined;

          for (let mod in data) {
            let moddata = {};
            try { moddata = require(`../config/moduledata/${mod}.json`); }
            catch (ex) { }
            this.m[mod] = require(`./modules/${mod}`)(this, data[mod], moddata, this.lang);
          }
          
          resolve();
        })
        .catch(err => {
          console.error('An error occured while fetching module configuration data');
          console.error(err);
          reject(err);
        })
    });
  }

  lang(key: string) {
    let res = require(`../config/lang.json`)[key];
    if (!res) return '';
    if (res.length !== undefined) return res[Math.floor(Math.random() * res.length)];
    return res;
  }

  reload(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.removeAllListeners();
      fixReactionEvent(this);
      await this.loadModules();
      this.emit('ready');
      resolve();
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

interface moduledata {
  commands?: {
    getCommands: () => Command[];
    getActiveInCommandsChannel: () => string[]
  };
  getpoints?: {
    onUserLevelup: (user: ClubUser, newLevel: number, rewards: any) => void
  };
  [key: string]: any;
}

interface ModLog {
  log: (guild: Guild, type: modlogType, text: string) => void
}
