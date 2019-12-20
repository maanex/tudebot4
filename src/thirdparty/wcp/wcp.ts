
import { User as DiscordUser } from "discord.js";
import { resolve } from "dns";
import { rejects } from "assert";
import { hook_stdout } from "./stdutils";

const fetch = require('node-fetch');

const settings = require('../../../config/settings.json').thirdparty;

export interface WcpData {
    ping?: boolean;
    status_mode?: string;
    status_discord?: string;
    status_tudeapi?: string;
    status_current_version?: string;
    status_current_latest_build?: string;
    status_current_last_sync?: string;
    status_current_build_status?: string;
    running?: boolean;
    sysout?: string;
    syserr?: string;
}

export default class WCP {

    public static get endpoint() {
        return settings.wcp.endpoint;
    }
    
    public static get secret() {
        return settings.wcp.secret;
    }

    //

    private static sysout = [];
    private static syserr = [];

    public static init() {
        console.log("yeetus deletus")
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
            if (c++ >= 5) c = 0;
            if (update) {
                WCP.send({ sysout: this.sysout.join('<br>'), syserr: this.syserr.join('<br>') });
                this.sysout = [];
                this.syserr = [];
            } else if (c == 0) WCP.send({ ping: true });
        }, 1000);

        hook_stdout((o,) => WCP.sysout.push(o));
    }

    public static reload() {
        this.init();
    }

    //

    public static send(data: WcpData) {
        fetch(this.endpoint, {
            method: 'post',
            headers: { 'authorization': this.secret, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(o => o.json())
            .then(o => {})
            .catch(console.error);
    }

}