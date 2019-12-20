"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdutils_1 = require("./stdutils");
const fetch = require('node-fetch');
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
            status_mode: '+Online',
            status_discord: '*Connecting...',
            status_tudeapi: '*Connecting...',
            status_current_version: '4.0',
            status_current_latest_build: '4.0',
            status_current_last_sync: new Date().toString(),
            status_current_build_status: 'Success',
        });
        let c = 0;
        setInterval(() => {
            let update = WCP.sysout.length || WCP.syserr.length;
            if (c++ >= 5)
                c = 0;
            if (update) {
                WCP.send({ sysout: this.sysout.join('<br>'), syserr: this.syserr.join('<br>') });
                this.sysout = [];
                this.syserr = [];
            }
            else if (c == 0)
                WCP.send({ ping: true });
        }, 1000);
        stdutils_1.hook_stdout((o) => WCP.sysout.push(o));
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
WCP.syserr = [];
//# sourceMappingURL=wcp.js.map