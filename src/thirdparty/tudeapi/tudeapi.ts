
import { User as DiscordUser } from "discord.js";

import WCP from "../../thirdparty/wcp/wcp";
import { TudeBot } from "../..";
import { badgeEmojiList } from "./badgelist";
import GetPointsModule from "../../modules/getpoints";
import { Item, StackableItem, ItemCategory, ItemGroup, ExpandedItem } from "./item";
import { ItemList } from "./itemlist";


const fetch = require('node-fetch');

const settings = require('../../../config/settings.json').thirdparty;


export interface User {
    error: boolean;
    id: string;
    type: number;
    name: string;
    tag: number;
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
    daily: {
        last: Date;
        claimable: boolean;
        streak: number;
    }
    badges: {
        '1': number; '2': number; '3': number;
        '4': number; '5': number; '6': number;
        '7': number; '8': number; '9': number;
    };
    inventory: Map<string, Item>;
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
    getAppearance: (level) => {
        from: number;
        name: string;
        icon: string;
        id: number;
        emoji: string;      
    };
}

export interface Leaderboard {
    alltime: ClubUser[];
    month: ClubUser[];
    season: number;
    updated: number;
}

export interface DeprItem {
    id: string;
    ref: string;
    name: string;
    category: { id: string, name: string, namepl: string };
    type: { id: string, name: string, namepl: string };
    amount: number;
    meta: any;
    expanded: boolean;
    tradeable: boolean;
    sellable: boolean;
    purchaseable: boolean;
    icon: string;
}

export type ClubAction = { id: 'claim_daily_reward' }
                       | { id: 'transaction', type: 'cookie' | string, amount: number, reciever: string }
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

    public static clubLang: any = {};

    //

    public static init(language: 'en' | 'de'): Promise<void> {
        return new Promise(async (resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.badges, {
                method: 'get',
                headers: { 'auth': this.key } })
                .then(o => o.json())
                .then(o => {
                    this.badges = o;
                    for (let b of this.badges) {
                        b.getAppearance = function(level: number): { from: number; name: string; icon: string; id: number; emoji: string; } {
                            let appearance = b.appearance[0];
                            let appid = -1;
                            for (let a of b.appearance) {
                                if (a.from <= level)
                                    appearance = a;
                                else break;
                                appid++;
                            }
                            return {
                                from: appearance.from,
                                name: appearance.name,
                                icon: appearance.icon,
                                id: appid,
                                emoji: badgeEmojiList[b.id][appid]
                            };
                        };
                    }
                    WCP.send({ status_tudeapi: '+Connected' });
                })
                .catch(err => {
                    console.error(err);
                    WCP.send({ status_tudeapi: '-Connection failed' });
                });
            //

            const langLoaded = () => {
                // fetch(this.baseurl + this.endpoints.club.items, {
                //     method: 'get',
                //     headers: { 'auth': this.key } })
                //     .then(o => o.json())
                //     .then(o => {
                //         for (const i of o) {
                //             // const item: Item = {
                //             //     id: i.id,
                //             //     ref: i.id,
                //             //     name: this.clubLang['item_' + i.id] || i.id,
                //             //     category: { id: i.cat, name: this.clubLang['itemcat_' + (i.cat || 'null')] || '', namepl: this.clubLang['itemcatpl_' + (i.cat || 'null')] || '' },
                //             //     type: { id: i.type, name: this.clubLang['itemtype_' + (i.type || 'null')] || '', namepl: this.clubLang['itemtypepl_' + (i.type || 'null')] || '' },
                //             //     amount: 0,
                //             //     meta: {},
                //             //     expanded: (i.prop & 0b0001) != 0,
                //             //     tradeable: (i.prop & 0b0010) != 0,
                //             //     sellable: (i.prop & 0b0100) != 0,
                //             //     purchaseable: (i.prop & 0b1000) != 0,
                //             //     icon: 'TODO'
                //             // };
                //             // this.items.push(item);
                //         }
                //         resolve();
                //     })
                //     .catch(err => {
                //         console.error(err);
                //         reject();
                //     });
                resolve();
            }
            //

            await fetch(this.baseurl + this.endpoints.club.lang + language, {
                method: 'get',
                headers: { 'auth': this.key } })
                .then(o => o.json())
                .then(o => {
                    this.clubLang = o;
                    langLoaded();
                })
                .catch(err => {
                    console.error(err);
                    langLoaded(); // Yes it's not loaded but whatever, they'll have to handle it without a lang file then, I don't care
                    reject();
                });
            //

        });
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
                    if (o) {
                        o['_raw_inventory'] = o.inventory;
                        o.inventory = [];
                        for (let ref in o['_raw_inventory'])
                            o.inventory.push(this.parseItem(ref, o['_raw_inventory'][ref]));                        
    
                        o['_raw_daily'] = o.daily;
                        o.daily = this.parseClubUserDailyData(o.daily);
                        
                        o['_org_points'] = o['points'] || 0;
                        o['_org_cookies'] = o['cookies'] || 0;
                        o['_org_gems'] = o['gems'] || 0;
                        o['_org_keys'] = o['keys'] || 0;
                        o['_org_profile_disp_badge'] = o['profile'] && o['profile']['disp_badge'];
                    }
                    resolve(o);
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
                            o['_raw_inventory'] = o.inventory;
                            o.inventory = new Map<string, Item>();
                            for (let ref in o['_raw_inventory'])
                                o.inventory.set(ref, this.parseItem(ref, o['_raw_inventory'][ref]));

                            o['_raw_daily'] = o.daily;
                            o.daily = this.parseClubUserDailyData(o.daily);

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

    private static parseClubUserDailyData(rawDaily: any): { last: Date, claimable: boolean, streak: number } {
        let daynum: number = rawDaily.last;
        let date = new Date((daynum >> 9) + 2000, (daynum >> 5) & 0b1111, daynum & 0b11111);
        let delta = new Date().getTime() - date.getTime();
        let today = delta <= 86400000;
        let yesterday = delta >= 86400000 && delta <= 86400000 * 2;
        return {
            last: date,
            claimable: !today,
            streak: (today || yesterday) ? rawDaily.streak : 0
        }
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
                    TudeBot.getModule<GetPointsModule>('getpoints').onUserLevelup(user, o['levelup']['level'], o['levelup']);
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

    public static parseItem(ref: string, item: any): Item {
        let id = item.id || ref;
        let amount = item.amount == undefined ? 1 : item.amount;
        let meta = item.meta == undefined ? {} : item.meta;

        const prefab = ItemList.find(i => i.id == id);

        if (!prefab) {
            console.error(`No item prefab found for ${id}!`);
            return undefined;
        }

        let instance: Item = null;
        if (prefab.parse) {
            const nitem = JSON.parse(JSON.stringify(item));
            nitem['type'] = nitem['id'];
            nitem['id'] = ref;
            instance = prefab.parse(nitem);
        } else if (prefab.class.prototype instanceof StackableItem) {
            instance = new prefab.class(prefab, amount);
        } else if (prefab.class.prototype instanceof ExpandedItem) {
            instance = new prefab.class(prefab, ref, meta);
        } else {
            instance = new prefab.class(prefab, ref, amount, meta);
        }

        return instance;
    }

}
