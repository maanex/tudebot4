import { Module, modlogFunction } from './types';
import { Client, User } from "discord.js";
import TudeApi from './thirdparty/tudeapi/tudeapi';
import WCP from './thirdparty/wcp/wcp';
import Database from './database/database';
import MongoAdapter from './database/mongo.adapter';
import { Util } from './util/util';
import { logVersionDetails } from "./util/gitParser";
import * as chalk from "chalk";
import ParseArgs from './util/parseArgs';

const settings = require('../config/settings.json');


export class TudeBotClient extends Client {

  public readonly devMode;

  public modlog: modlogFunction;
  public modules: Map<string, Module> = null;

  constructor(props: any, flags: {[key: string]: string | boolean}) {
    super(props);

    this.devMode = !!flags['dev'];
    
    this.modlog = null;
    this.modules = new Map();

    if (this.devMode) {
      console.log(chalk.bgRedBright.black(' RUNNING DEV MODE '));
    }

    fixReactionEvent(this);

    Util.init();
    WCP.init(false /* this.devMode */);

    MongoAdapter.connect(settings.mongodb.url)
      .catch(err => {
        console.error(err);
        WCP.send({ status_mongodb: '-Connection failed' });
      })
      .then(async () => {
        console.log('Connected to Mongo');
        WCP.send({ status_mongodb: '+Connected' });

        logVersionDetails();

        await TudeApi.init(settings.lang);
        await Database.init();

        this.on('ready', () => {
          console.log('Bot ready! Logged in as ' + chalk.yellowBright(this.user.tag));
          WCP.send({ status_discord: '+Connected' });
          
          for (let mod of this.modules.values()) {
            mod.onBotReady();
          }
        });
    
        await this.loadModules(false);
        this.login(settings.bot.token);
      });
  }

  loadModules(isReload: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      Database
        .collection('settings')
        .findOne({ _id: 'modules' })
        .then(data => {
          data = data.data;

          WCP.send({ config_modules: JSON.stringify(data) });
          
          for (let mod of this.modules.values()) {
            mod.onDisable();
          }
          
          this.modules = new Map();
          this.modlog = undefined;

          for (let mod in data) {
            let modData = {};
            try { modData = require(`../config/moduledata/${mod}.json`); }
            catch (ex) { }
            try {
              const ModClass = require(`./modules/${mod}`).default;
              let module: Module = new ModClass(data[mod], modData, this.lang);
              this.modules.set(mod, module);
              module.onEnable();
              if (isReload) module.onBotReady();
            } catch (ex) {
              console.error(ex);
            }
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

  lang(key: string): string {
    let res = require(`../config/lang.json`)[key];
    if (!res) return '';
    if (res.length !== undefined) return res[Math.floor(Math.random() * res.length)];
    return res;
  }

  reload(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.removeAllListeners();
      fixReactionEvent(this);
      await this.loadModules(true);
      this.emit('ready');
      resolve();
    });
  }

  getModule<T extends Module>(name: string): T {
    return this.modules.get(name) as T;
  }

}


const flags = ParseArgs.parse(process.argv);
export const TudeBot = new TudeBotClient ({ }, flags);


function fixReactionEvent(bot: TudeBotClient) {
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
