"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
const settings = require('../../../config/settings.json');
class TudeApi {
    static get baseurl() {
        return settings.thirdparty.tudeapi.baseurl;
    }
    static get key() {
        return settings.thirdparty.tudeapi.key;
    }
    static get endpoints() {
        return {
            ping: 'ping/',
            users: 'users/',
            club: {
                users: 'club/users/',
                memes: 'club/memes/',
                badges: 'club/badges/',
                leaderboard: 'club/leaderboard/'
            }
        };
    }
    //
    static init() {
        fetch(this.baseurl + this.endpoints.club.badges, {
            method: 'get',
            headers: { 'auth': this.key },
        })
            .then(o => o.json())
            .then(o => this.badges = o)
            .catch(console.error);
    }
    static reload() {
        this.init();
    }
    //
    static userById(id) {
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
    static userByDiscordId(id, orCreate) {
        let status;
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
            fetch(this.baseurl + this.endpoints.users, {
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
    static clubUserByDiscordId(id, orCreate) {
        let status;
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
                }
                else {
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
    static badgeById(id) {
        return this.badges.find(b => b.id == id);
    }
    static badgeByKeyword(keyword) {
        return this.badges.find(b => b.keyword == keyword.toLowerCase());
    }
    static clubLeaderboard() {
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
    static updateUser(user) {
        fetch(this.baseurl + this.endpoints.users + user.id, {
            method: 'put',
            body: JSON.stringify(user),
            headers: { 'auth': this.key, 'Content-Type': 'application/json' },
        });
    }
    static updateClubUser(user) {
        let u = {};
        u.points = { add: user.points - user['_org_points'] };
        u.cookies = { add: user.cookies - user['_org_cookies'] };
        u.gems = { add: user.gems - user['_org_gems'] };
        fetch(this.baseurl + this.endpoints.club.users + user.id, {
            method: 'put',
            body: JSON.stringify(u),
            headers: { 'auth': this.key, 'Content-Type': 'application/json' },
        })
            .then(o => o.json())
            .then(o => {
            user['_org_points'] += u.points.add;
            user['_org_cookies'] += u.cookies.add;
            user['_org_gems'] += u.gems.add;
        })
            .catch(err => { });
    }
    static performClubUserAction(user, action) {
        let status;
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + user.id, {
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
                .catch(err => reject());
        });
    }
}
exports.default = TudeApi;
TudeApi.badges = [];
//# sourceMappingURL=tudeapi.js.map