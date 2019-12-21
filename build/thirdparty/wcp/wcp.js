"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdutils_1 = require("./stdutils");
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
        console.log("yeetus deletus");
        WCP.send({
            running: true,
            status_mode: '+Productive',
            status_discord: '*Connecting...',
            status_tudeapi: '*Connecting...',
            status_current_version: '4.0',
            status_current_latest_build: '4.0',
            status_current_last_sync: new Date().toString(),
            status_current_build_status: 'Success',
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
            .then(o => { })
            .catch(console.error);
    }
}
exports.default = WCP;
//
WCP.sysout = [];
//# sourceMappingURL=wcp.js.map