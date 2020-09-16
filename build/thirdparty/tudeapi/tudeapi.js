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
const wcp_1 = require("../../thirdparty/wcp/wcp");
const index_1 = require("../../index");
const badgelist_1 = require("./badgelist");
const item_1 = require("./item");
const itemlist_1 = require("../../content/itemlist");
const node_fetch_1 = require("node-fetch");
let TudeApi = /** @class */ (() => {
    class TudeApi {
        static get baseurl() {
            return index_1.TudeBot.config.thirdparty.tudeapi.baseurl;
        }
        static get key() {
            return index_1.TudeBot.config.thirdparty.tudeapi.key;
        }
        static get endpoints() {
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
            };
        }
        //
        static init(language) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                node_fetch_1.default(this.baseurl + this.endpoints.club.badges, {
                    method: 'get',
                    headers: { 'auth': this.key }
                })
                    .then(o => o.json())
                    .then(o => {
                    this.badges = o;
                    for (let b of this.badges) {
                        b.getAppearance = function (level) {
                            let appearance = b.appearance[0];
                            let appid = -1;
                            for (let a of b.appearance) {
                                if (a.from <= level)
                                    appearance = a;
                                else
                                    break;
                                appid++;
                            }
                            return {
                                from: appearance.from,
                                name: appearance.name,
                                icon: appearance.icon,
                                id: appid,
                                emoji: badgelist_1.badgeEmojiList[b.id][appid]
                            };
                        };
                    }
                    wcp_1.default.send({ status_tudeapi: '+Connected' });
                })
                    .catch(err => {
                    console.error(err);
                    wcp_1.default.send({ status_tudeapi: '-Connection failed' });
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
                };
                //
                yield node_fetch_1.default(this.baseurl + this.endpoints.club.lang + language, {
                    method: 'get',
                    headers: { 'auth': this.key }
                })
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
            }));
        }
        static reload() {
            this.init(this.clubLang._id);
        }
        //
        static userById(id) {
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.users + id, {
                    method: 'get',
                    headers: { 'auth': this.key },
                })
                    .then(o => o.json())
                    .then(o => resolve(o))
                    .catch(err => reject(err));
            });
        }
        static userByDiscordId(id, orCreate) {
            let status;
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.users + 'find?discord=' + id, {
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
                    }
                    else
                        resolve(o);
                })
                    .catch(err => reject(err));
            });
        }
        static createNewUser(options) {
            let status;
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.users, {
                    method: 'post',
                    body: JSON.stringify(options),
                    headers: { 'auth': this.key, 'Content-Type': 'application/json' },
                })
                    .then(res => {
                    status = res.status;
                    return res.json();
                })
                    .then(o => {
                    if (status == 200)
                        resolve();
                    else
                        reject();
                })
                    .catch(err => reject());
            });
        }
        static clubUserById(id) {
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.club.users + id, {
                    method: 'get',
                    headers: { 'auth': this.key },
                })
                    .then(o => o.json())
                    .then(o => {
                    if (o) {
                        o['_raw_inventory'] = o.inventory;
                        o.inventory = new Map();
                        for (let ref in o['_raw_inventory'])
                            o.inventory.set(ref, this.parseItem(ref, o['_raw_inventory'][ref]));
                        o['_raw_daily'] = o.daily;
                        o.daily = this.parseClubUserDailyData(o.daily);
                        this.mountClubUserFunctions(o);
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
        static clubUserByDiscordId(id, orCreate) {
            let status;
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.club.users + 'find?discord=' + id, {
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
                    }
                    else {
                        if (o) {
                            o['_raw_inventory'] = o.inventory;
                            o.inventory = new Map();
                            for (let ref in o['_raw_inventory'])
                                o.inventory.set(ref, this.parseItem(ref, o['_raw_inventory'][ref]));
                            o['_raw_daily'] = o.daily;
                            o.daily = this.parseClubUserDailyData(o.daily);
                            this.mountClubUserFunctions(o);
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
        static parseClubUserDailyData(rawDaily) {
            if (!rawDaily)
                return { last: new Date(0), claimable: true, streak: 0 };
            let daynum = rawDaily.last;
            let date = new Date((daynum >> 9) + 2000, (daynum >> 5) & 0b1111, daynum & 0b11111);
            let delta = new Date().getTime() - date.getTime();
            let today = delta <= 86400000;
            let yesterday = delta >= 86400000 && delta <= 86400000 * 2;
            return {
                last: date,
                claimable: !today,
                streak: (today || yesterday) ? rawDaily.streak : 0
            };
        }
        static mountClubUserFunctions(u) {
            u.addItem = (item, amount, meta) => {
                if (amount == undefined)
                    amount = 1;
                let itemi = null;
                if (item._isDef) {
                    switch (item.id) {
                        case 'cookie':
                            u.cookies += amount;
                            itemi = item.create(u.cookies);
                            break;
                        case 'gem':
                            u.gems += amount;
                            itemi = item.create(u.gems);
                            break;
                        case 'key':
                            u.keys += amount;
                            itemi = item.create(u.keys);
                            break;
                        default: return null;
                    }
                }
                else if (u.inventory.has(item.id)) {
                    if (item.expanded) {
                        return null;
                    }
                    itemi = u.inventory.get(item.id);
                    itemi.amount += amount;
                }
                else {
                    const itemInstance = item.expanded ? new item.class(item, item.id, meta || {}) : new item.class(item, amount);
                    u.inventory.set(item.id, itemInstance);
                    itemi = itemInstance;
                }
                return itemi;
            };
        }
        static badgeById(id) {
            return this.badges.find(b => b.id == id);
        }
        static badgeByKeyword(keyword) {
            return this.badges.find(b => b.keyword == keyword.toLowerCase());
        }
        static badgeBySearchQuery(search) {
            return this.badges.find(b => {
                b.description.includes(search.toLowerCase()) ||
                    b.info.includes(search.toLowerCase()) ||
                    b.getAppearance(0).name.includes(search.toLowerCase());
            });
        }
        static clubLeaderboard() {
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.club.leaderboard, {
                    method: 'get',
                    headers: { 'auth': this.key },
                })
                    .then(o => o.json())
                    .then(o => resolve(o))
                    .catch(err => reject(err));
            });
        }
        static updateUser(user) {
            node_fetch_1.default(this.baseurl + this.endpoints.users + user.id, {
                method: 'put',
                body: JSON.stringify(user),
                headers: { 'auth': this.key, 'Content-Type': 'application/json' },
            });
        }
        static updateClubUser(user) {
            let u = {};
            u.points = { add: user.points - user['_org_points'] };
            if (!u.points.add)
                delete u.points;
            u.cookies = { add: user.cookies - user['_org_cookies'] };
            if (!u.cookies.add)
                delete u.cookies;
            u.gems = { add: user.gems - user['_org_gems'] };
            if (!u.gems.add)
                delete u.gems;
            u.keys = { add: user.keys - user['_org_keys'] };
            if (!u.keys.add)
                delete u.keys;
            if (user.profile && user.profile.disp_badge != user['_org_profile_disp_badge'])
                u['profile'] = { disp_badge: user.profile.disp_badge };
            const updatedItems = [];
            if (user.inventory) {
                u.inventory = {};
                let ichanges = false;
                user.inventory.forEach((item, key) => {
                    const org = user['_raw_inventory'][key];
                    let out = {};
                    let changes = false;
                    if (!org) {
                        out = {
                            amount: item.amount,
                            meta: item.metaChanges
                        };
                        updatedItems.push(item);
                        changes = true;
                    }
                    else {
                        if (item.prefab.expanded) {
                            if (item.metaChanges) {
                                out.meta = item.metaChanges;
                                updatedItems.push(item);
                                changes = true;
                            }
                            if (item.amount == 0) {
                                out.amount = 0;
                                changes = true;
                            }
                        }
                        else {
                            if (!org.amount)
                                org.amount = 1;
                            if (org.amount != item.amount) {
                                out.amount = { add: item.amount - org.amount };
                                updatedItems.push(item);
                                changes = true;
                            }
                        }
                    }
                    if (changes) {
                        u.inventory[key] = out;
                        ichanges = true;
                    }
                });
                if (!ichanges)
                    delete u.inventory;
            }
            node_fetch_1.default(this.baseurl + this.endpoints.club.users + user.id, {
                method: 'put',
                body: JSON.stringify(u),
                headers: { 'auth': this.key, 'Content-Type': 'application/json' },
            })
                .then(o => o.json())
                .then(o => {
                user['_org_points'] += u.points ? u.points.add : 0;
                user['_org_cookies'] += u.cookies ? u.cookies.add : 0;
                user['_org_gems'] += u.gems ? u.gems.add : 0;
                user['_org_keys'] += u.keys ? u.keys.add : 0;
                user['_org_profile_disp_badge'] = u.profile && u.profile.disp_badge;
                if (o['levelup'] != undefined)
                    index_1.TudeBot.getModule('getpoints').onUserLevelup(user, o['levelup']['level'], o['levelup']);
                if (o['items']) {
                    for (const id of o['items']) {
                        if (!updatedItems.length)
                            break;
                        updatedItems[0].id = id;
                        updatedItems.splice(0, 1);
                    }
                }
            })
                .catch(console.error);
        }
        static performClubUserAction(user, action) {
            return this.performClubUserActionRaw(user.id, action);
        }
        static performClubUserActionRaw(query, action) {
            let status;
            return new Promise((resolve, reject) => {
                node_fetch_1.default(this.baseurl + this.endpoints.club.users + query, {
                    method: 'post',
                    body: JSON.stringify(action),
                    headers: { 'auth': this.key, 'Content-Type': 'application/json' },
                })
                    .then(res => {
                    status = res.status;
                    return res.json();
                })
                    .then(o => {
                    if (status == 200)
                        resolve(o);
                    else
                        reject(o);
                })
                    .catch(err => {
                    if (process.env.NODE_ENV !== 'production')
                        console.error(err);
                    reject();
                });
            });
        }
        static parseItem(ref, item) {
            let id = item.id || ref;
            let amount = item.amount == undefined ? 1 : item.amount;
            let meta = item.meta == undefined ? {} : item.meta;
            const prefab = itemlist_1.ItemList.find(i => i.id == id);
            if (!prefab) {
                console.error(`No item prefab found for ${id}!`);
                return undefined;
            }
            let instance = null;
            if (prefab.parse) {
                const nitem = JSON.parse(JSON.stringify(item));
                nitem['type'] = nitem['id'];
                nitem['id'] = ref;
                instance = prefab.parse(nitem);
            }
            else if (prefab.class.prototype instanceof item_1.StackableItem) {
                instance = new prefab.class(prefab, amount);
            }
            else if (prefab.class.prototype instanceof item_1.ExpandedItem) {
                instance = new prefab.class(prefab, ref, meta);
            }
            else {
                instance = new prefab.class(prefab, ref, amount, meta);
            }
            return instance;
        }
    }
    TudeApi.badges = [];
    TudeApi.clubLang = {};
    return TudeApi;
})();
exports.default = TudeApi;
//# sourceMappingURL=tudeapi.js.map