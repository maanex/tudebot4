
import { User as DiscordUser } from "discord.js";
import { resolve } from "dns";
import { rejects } from "assert";

import WCP from "../../thirdparty/wcp/wcp.js";
import { Core } from "../../index";

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
    keys: number;
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

export interface Item {
    id: string;
    name: string;
    category: { id: string, name: string };
    type: { id: string, name: string };
    amount: number;
    meta: any;
    expanded: boolean;
    tradeable: boolean;
    sellable: boolean;
    purchaseable: boolean;
}

export type ClubAction = { id: 'claim_daily_reward' }
                       | { id: 'transaction', type: 'cookies' | string, amount: number }
                       ;

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
                leaderboard: 'club/leaderboard/',
                lang: 'club/lang/',
                items: 'club/items/'
            }
        }
    }

    public static badges: Badge[] = [];
    public static items: Item[] = [];

    public static clubLang: any = {};

    //

    public static async init(language: 'en' | 'de') {
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
        //

        let langLoaded = () => {
            fetch(this.baseurl + this.endpoints.club.items, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => {
                    for (let i of o) {
                        let item: Item = {
                            id: i.id,
                            name: this.clubLang['item_' + i.id],
                            category: { id: i.cat, name: this.clubLang['itemcategory_' + i.cat] },
                            type: { id: i.type, name: this.clubLang['itemtype_' + i.type] },
                            amount: 0,
                            meta: {},
                            expanded: (i.prop & 0b0001) != 0,
                            tradeable: (i.prop & 0b0010) != 0,
                            sellable: (i.prop & 0b0100) != 0,
                            purchaseable: (i.prop & 0b1000) != 0,
                        };
                        this.items.push(item);
                    }
                })
                .catch(console.error);
        }
        //

        await fetch(this.baseurl + this.endpoints.club.lang + language, {
            method: 'get',
            headers: { 'auth': this.key },
        })
            .then(o => o.json())
            .then(o => {
                this.clubLang = o;
                langLoaded();
            })
            .catch(console.error);
        //
    }

    public static reload() {
        this.init(this.clubLang._id);   
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
                    o['_org_points'] = o['points'] || 0;
                    o['_org_cookies'] = o['cookies'] || 0;
                    o['_org_gems'] = o['gems'] || 0;
                    o['_org_keys'] = o['keys'] || 0;
                    o['_org_profile_disp_badge'] = o['profile'] && o['profile']['disp_badge'];
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
                            o['_org_points'] = o['points'] || 0;
                            o['_org_cookies'] = o['cookies'] || 0;
                            o['_org_gems'] = o['gems'] || 0;
                            o['_org_keys'] = o['keys'] || 0;
                            o['_org_profile_disp_badge'] = o['profile'] && o['profile']['disp_badge'];
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
        u.keys = { add: user.keys - user['_org_keys'] };
        if (user.profile && user.profile.disp_badge != user['_org_profile_disp_badge'])
            u['profile'] = { disp_badge: user.profile.disp_badge };
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
                user['_org_keys'] += u.keys.add;
                user['_org_profile_disp_badge'] = u.profile && u.profile.disp_badge;
                if (o['levelup'] != undefined)
                    Core.m['getpoints'].onUserLevelup(user, o['levelup']['level'], o['levelup']);
            })
            .catch(console.error);
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