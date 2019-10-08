import { modlogType } from 'types';

import { Client, Guild } from "discord.js";

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
      'counting'
    ];

    this.modules.forEach(mod => {
      this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], require(`../config/moduledata/${mod}.json`));
    });

    this.on('ready', () => console.log('Bot ready!')); 

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


/* */

interface ModLog {
  log: (guild: Guild, type: modlogType, text: string) => void
}