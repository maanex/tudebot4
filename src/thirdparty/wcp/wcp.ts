
import { User as DiscordUser } from "discord.js";
import { hook_std } from "./stdutils";
import { Core, TudeBot } from "../..";
import Database from "../../database/database";


const freestuffCmd = require("../../commands/freestuff");

const fetch = require('node-fetch');
const chalk = require('chalk');

const settings = require('../../../config/settings.json').thirdparty;

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
        return settings.wcp.endpoint;
    }
    
    public static get secret() {
        return settings.wcp.secret;
    }

    //

    private static sysout = [];

    public static init() {
        WCP.send({
            running: true,
            status_mode: '+Productive',
            status_discord: '*Connecting...',
            status_tudeapi: '*Connecting...',
            status_mongodb: '*Connecting...',
            status_current_version: '4.0',
            status_current_latest_build: '4.0',
            status_current_last_sync: new Date().toString(),
            status_current_build_status: 'Success',
            config_modules: '',
            config_commands: '',
        });

        let c = 0;
        setInterval(() => {
            if (c++ >= 5) c = 0;
            if (this.sysout.length) WCP.send({ sysout: this.sysout.join('\n') });
            else if (c == 0) WCP.send({ ping:true });
            this.sysout = [];
        }, 1000);

        hook_std((o) => WCP.sysout.push(o), process.stdout);
        hook_std((o) => WCP.sysout.push(chalk.bold.redBright(o)), process.stderr);
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
            .then(this.handleBack)
            .catch(console.error);
    }

    private static handleBack(data: any) {
        if (!data.success) return;

        if (data.new_freestuff) {
            freestuffCmd.announce(Core.guilds.get('432899162150010901'), data.new_freestuff);
        }

        if (data.configure_modules) {
            let obj = JSON.parse(data.configure_modules);
            if (obj) {
                Database
                    .collection('settings')
                    .updateOne({ _id: 'modules' }, { '$set': { data: obj }});
                console.log(chalk.blue('Module settings got updated remotely. Reloading.'))
                Core.reload();
            }
        }
        if (data.configure_commands) {
            let obj = JSON.parse(data.configure_commands);
            if (obj) {
                Database
                    .collection('settings')
                    .updateOne({ _id: 'commands' }, { '$set': { data: obj }});
                console.log(chalk.blue('Command settings got updated remotely. Reloading.'))
                Core.reload();
            }
        }
    }

}