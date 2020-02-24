"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdutils_1 = require("./stdutils");
const __1 = require("../..");
const database_1 = require("../../database/database");
const freestuffCmd = require("../../commands/freestuff");
const fetch = require('node-fetch');
const chalk = require('chalk');
const settings = require('../../../config/settings.json').thirdparty;
class WCP {
    static get endpoint() {
        return settings.wcp.endpoint;
    }
    static get secret() {
        return settings.wcp.secret;
    }
    static init() {
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
        setInterval(() => {
            if (c++ >= 5)
                c = 0;
            if (this.sysout.length)
                WCP.send({ sysout: this.sysout.join('\n') });
            else if (c == 0)
                WCP.send({ ping: true });
            this.sysout = [];
        }, 1000);
        stdutils_1.hook_std((o) => WCP.sysout.push(o), process.stdout);
        stdutils_1.hook_std((o) => WCP.sysout.push(chalk.bold.redBright(o)), process.stderr);
    }
    static reload() {
        this.init();
    }
    //
    static send(data) {
        fetch(this.endpoint, {
            method: 'post',
            headers: { 'authorization': this.secret, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(o => o.json())
            .then(this.handleBack)
            .catch(console.error);
    }
    static handleBack(data) {
        if (!data.success)
            return;
        if (data.new_freestuff) {
            freestuffCmd.announce(__1.TudeBot.guilds.get('432899162150010901'), data.new_freestuff);
        }
        if (data.configure_modules) {
            let obj = JSON.parse(data.configure_modules);
            if (obj) {
                database_1.default
                    .collection('settings')
                    .updateOne({ _id: 'modules' }, { '$set': { data: obj } });
                console.log(chalk.blue('Module settings got updated remotely. Reloading.'));
                if (!data.reload)
                    __1.TudeBot.reload();
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
                    __1.TudeBot.reload();
            }
        }
        if (data.reload) {
            __1.TudeBot.reload();
        }
    }
}
exports.default = WCP;
//
WCP.sysout = [];
//# sourceMappingURL=wcp.js.map