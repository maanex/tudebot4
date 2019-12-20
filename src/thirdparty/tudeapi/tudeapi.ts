
import { User as DiscordUser } from "discord.js";
import { resolve } from "dns";
import { rejects } from "assert";

import WCP from "../../thirdparty/wcp/wcp.js";

const fetch = require('node-fetch');

const settings = require('../../../config/settings.json').thirdparty;


export interface User {
    error: boolean;
    id: string;
    type: number;
    name: string;
    tag: string;
}

export interface ClubUser {
    error: boolean;
    id: string;
    points: number;
    points_month: number;
    level: number;
    level_progress: number;
    cookies: number;
    gems: number;
    badges: {
        '1': number; '2': number; '3': number;
        '4': number; '5': number; '6': number;
        '7': number; '8': number; '9': number;
    };
    profile: {
        disp_badge: number;
    };
    user: User;
}

export interface Badge {
    id: number;
    keyword: string;
    description: string;
    info: string;
    appearance: {
      from: number;
      name: string;
      icon: string;      
    }[];
}

export interface Leaderboard {
    alltime: ClubUser[];
    month: ClubUser[];
    season: number;
    updated: number;
}

export type ClubAction = { id: 'claim_daily_reward' }/* | { id: 'test', a: number }*/;

export default class TudeApi {

    public static get baseurl() {
        return settings.tudeapi.baseurl;
    }
    
    public static get key() {
        return settings.tudeapi.key;
    }

    public static get endpoints() {
        return {
            ping: 'ping/',
            users: 'users/',
            club: {
                users: 'club/users/',
                memes: 'club/memes/',
                badges: 'club/badges/',
                leaderboard: 'club/leaderboard/'
            }
        }
    }

    public static badges: Badge[] = [];

    //

    public static init() {
        fetch(this.baseurl + this.endpoints.club.badges, {
            method: 'get',
            headers: { 'auth': this.key },
        })
            .then(o => o.json())
            .then(o => {
                this.badges = o;
                WCP.send({ status_tudeapi: '+Connected' });
            })
            .catch(err => {
                console.error(err);
                WCP.send({ status_tudeapi: '-Connection failed' });
            });
    }

    public static reload() {
        this.init();   
    }

    //

    public static userById(id: string):Promise<User> {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.users + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => resolve(o))
                .catch(err => reject(err));
        });
    }

    public static userByDiscordId(id: string, orCreate?: DiscordUser):Promise<User> {
        let status: number;
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.users + 'find?discord=' + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(res => {
                    status = res.status;
                    return res.json();
                })
                .then(o => {
                    if (status == 404 && orCreate) { // No user present
                        TudeApi.createNewUser({
                            type: 2,
                            name: orCreate.username,
                            accounts: { discord: orCreate.id }
                        }).then(() => {
                            resolve(this.userByDiscordId(id));
                        }).catch(err => resolve(o));
                    } else resolve(o);
                })
                .catch(err => reject(err));
        });
    }

    public static createNewUser(options: { type: number, name: string, email?: string, accounts?: { discord: string } }):Promise<void> {
        let status;
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.users, {
                method: 'post',
                body:    JSON.stringify(options),
                headers: { 'auth': this.key, 'Content-Type': 'application/json' },
            })
                .then(res => {
                    status = res.status;
                    return res.json();
                })
                .then(o => {
                    if (status == 200) resolve()
                    else reject();
                })
                .catch(err => reject());
        });
    }

    public static clubUserById(id: string):Promise<ClubUser> {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => {
                    o['_org_points'] = o['points'];
                    o['_org_cookies'] = o['cookies'];
                    o['_org_gems'] = o['gems'];
                })
                .catch(err => reject(err));
        });
    }

    public static clubUserByDiscordId(id: string, orCreate?: DiscordUser):Promise<ClubUser> {
        let status: number;
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + 'find?discord=' + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(res => {
                    status = res.status;
                    return res.json();
                })
                .then(o => {
                    if (status == 404 && orCreate) { // No user present
                        TudeApi.createNewUser({
                            type: 2,
                            name: orCreate.username,
                            accounts: { discord: orCreate.id }
                        }).then(() => {
                            resolve(this.clubUserByDiscordId(id));
                        }).catch(err => resolve(o));
                    } else {
                        if (o) {
                            o['_org_points'] = o['points'];
                            o['_org_cookies'] = o['cookies'];
                            o['_org_gems'] = o['gems'];
                        }
                        resolve(o);
                    }
                })
                .catch(err => reject(err));
        });
    }

    public static badgeById(id: number):Badge {
        return this.badges.find(b => b.id == id);
    }

    public static badgeByKeyword(keyword: string):Badge {
        return this.badges.find(b => b.keyword == keyword.toLowerCase());
    }

    public static clubLeaderboard():Promise<Leaderboard> {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.leaderboard, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => resolve(o))
                .catch(err => reject(err));
        });
    }

    public static updateUser(user: User):void {
        fetch(this.baseurl + this.endpoints.users + user.id, {
            method: 'put',
            body:    JSON.stringify(user),
            headers: { 'auth': this.key, 'Content-Type': 'application/json' },
        });
    }

    public static updateClubUser(user: ClubUser):void {
        let u: any = { };
        u.points = { add: user.points - user['_org_points'] };
        u.cookies = { add: user.cookies - user['_org_cookies'] };
        u.gems = { add: user.gems - user['_org_gems'] };
        fetch(this.baseurl + this.endpoints.club.users + user.id, {
            method: 'put',
            body:    JSON.stringify(u),
            headers: { 'auth': this.key, 'Content-Type': 'application/json' },
        })
            .then(o => o.json())
            .then(o => {
                user['_org_points'] += u.points.add;
                user['_org_cookies'] += u.cookies.add;
                user['_org_gems'] += u.gems.add;
            })
            .catch(err => {});
    }

    public static performClubUserAction(user: ClubUser, action: ClubAction):Promise<void> {
        let status: number;
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + user.id, {
                method: 'post',
                body:    JSON.stringify(action),
                headers: { 'auth': this.key, 'Content-Type': 'application/json' },
            })
                .then(res => {
                    status = res.status;
                    return res.json();
                })
                .then(o => {
                    if (status == 200) resolve(o);
                    else reject(o);
                })
                .catch(err => reject());
        });
    }

}