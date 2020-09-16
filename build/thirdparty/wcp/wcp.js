"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const stdutils_1 = require("./stdutils");
const index_1 = require("../../index");
const database_1 = require("../../database/database");
const node_fetch_1 = require("node-fetch");
const chalk = require("chalk");
let WCP = /** @class */ (() => {
    class WCP {
        static get endpoint() {
            return index_1.config.thirdparty.wcp.endpoint;
        }
        static get secret() {
            return index_1.config.thirdparty.wcp.secret;
        }
        static init(offlineMode) {
            console.log(chalk.green(offlineMode
                ? 'Initialized WCP in offline mode'
                : 'Initialized WCP in online mode'));
            this.offlineMode = offlineMode;
            if (this.offlineMode)
                return;
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
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (c++ >= 5)
                    c = 0;
                if (this.sysout.length && !this.connectionLost) {
                    const connected = WCP.send({ sysout: this.sysout.join('\n') });
                    if (connected)
                        this.sysout = [];
                }
                else if (c == 0) {
                    WCP.send({ ping: true });
                }
            }), 1000);
            stdutils_1.hook_std((o) => WCP.sysout.push(o), process.stdout);
            stdutils_1.hook_std((o) => WCP.sysout.push(chalk.bold.redBright(o)), process.stderr);
        }
        static reload() {
            this.init(this.offlineMode);
        }
        //
        static send(data) {
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.endpoint, {
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
        static handleBack(data) {
            if (!data.success)
                return;
            if (data.configure_modules) {
                let obj = JSON.parse(data.configure_modules);
                if (obj) {
                    database_1.default
                        .collection('settings')
                        .updateOne({ _id: 'modules' }, { '$set': { data: obj } });
                    console.log(chalk.blue('Module settings got updated remotely. Reloading.'));
                    if (!data.reload)
                        index_1.TudeBot.reload();
                }
            }
            if (data.configure_commands) {
                let obj = JSON.parse(data.configure_commands);
                if (obj) {
                    database_1.default
                        .collection('settings')
                        .updateOne({ _id: 'commands' }, { '$set': { data: obj } });
                    console.log(chalk.blue('Command settings got updated remotely. Reloading.'));
                    if (!data.reload)
                        index_1.TudeBot.reload();
                }
            }
            if (data.reload) {
                index_1.TudeBot.reload();
            }
        }
    }
    //
    WCP.offlineMode = false;
    WCP.connectionLost = false;
    WCP.sysout = [];
    return WCP;
})();
exports.default = WCP;
//# sourceMappingURL=wcp.js.map