/* eslint-disable */

import { User as DiscordUser } from "discord.js";
import { hook_std } from "./stdutils";
import { TudeBot, config } from "../../index";
import Database from "../../database/database";
import fetch from "node-fetch";
import * as chalk from "chalk";


export interface WcpData {
  ping?: boolean;
  status_mode?: string;
  status_discord?: string;
  status_tudeapi?: string;
  status_mongodb?: string;
  status_current_version?: string;
  status_current_latest_build?: string;
  status_current_last_sync?: string;
  status_current_build_status?: string;
  config_modules?: string,
  config_commands?: string,
  running?: boolean;
  sysout?: string;
  syserr?: string;
}

export default class WCP {

  public static get endpoint() {
    return config.thirdparty.wcp.endpoint;
  }

  public static get secret() {
    return config.thirdparty.wcp.secret;
  }

  //

  private static offlineMode = false;
  private static connectionLost = false;

  private static sysout = [];

  public static init(offlineMode: boolean) {
    console.log(chalk.green(offlineMode
      ? 'Initialized WCP in offline mode'
      : 'Initialized WCP in online mode'));
    this.offlineMode = offlineMode;
    if (this.offlineMode) return;

    WCP.send({
      running: true,
      status_mode: '+Productive',
      status_discord: '*Connecting...',
      status_tudeapi: '*Connecting...',
      status_mongodb: '*Connecting...',
      status_current_version: '4.3',
      status_current_latest_build: '4.3',
      status_current_last_sync: new Date().toLocaleString(),
      status_current_build_status: 'Success',
      config_modules: '',
      config_commands: '',
    });

    let c = 0;
    setInterval(async () => {
      if (c++ >= 5) c = 0;
      if (this.sysout.length && !this.connectionLost) {
        const connected = WCP.send({ sysout: this.sysout.join('\n') });
        if (connected) this.sysout = [];
      } else if (c == 0) {
        WCP.send({ ping: true });
      }
    }, 1000);

    hook_std((o) => WCP.sysout.push(o), process.stdout);
    hook_std((o) => WCP.sysout.push(chalk.bold.redBright(o)), process.stderr);
  }

  public static reload() {
    this.init(this.offlineMode);
  }

  //

  public static send(data: WcpData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fetch(this.endpoint, {
        method: 'post',
        headers: { 'authorization': this.secret, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(o => o.json())
        .then(data => {
          if (!data.success) {
            resolve(false);
            return;
          }

          if (this.connectionLost) {
            console.log(chalk.gray('WCP reconnected!'));
            this.connectionLost = false;
          }

          this.handleBack(data);
          resolve(true);
        })
        .catch(err => {
          if (!this.connectionLost) {
            console.log(chalk.gray('WCP connection lost!'));
            this.connectionLost = true;
          }
          resolve(false);
        });
    });
  }

  private static handleBack(data: any) {
    if (!data.success) return;

    if (data.configure_modules) {
      let obj = JSON.parse(data.configure_modules);
      if (obj) {
        Database
          .collection('settings')
          .updateOne({ _id: 'modules' }, { '$set': { data: obj } });
        console.log(chalk.blue('Module settings got updated remotely. Reloading.'))
        if (!data.reload)
          TudeBot.reload();
      }
    }
    if (data.configure_commands) {
      let obj = JSON.parse(data.configure_commands);
      if (obj) {
        Database
          .collection('settings')
          .updateOne({ _id: 'commands' }, { '$set': { data: obj } });
        console.log(chalk.blue('Command settings got updated remotely. Reloading.'))
        if (!data.reload)
          TudeBot.reload();
      }
    }

    if (data.reload) {
      TudeBot.reload();
    }
  }

}