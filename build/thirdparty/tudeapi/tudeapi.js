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
    static userByDiscordId(id) {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.users + 'find?discord=' + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => resolve(o))
                .catch(err => reject(err));
        });
    }
    static clubUserById(id) {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => resolve(o))
                .catch(err => reject(err));
        });
    }
    static clubUserByDiscordId(id) {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + 'find?discord=' + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => resolve(o))
                .catch(err => reject(err));
        });
    }
    static badgeById(id) {
        return this.badges.find(b => b.id == id);
    }
    static badgeByKeyword(keyword) {
        return this.badges.find(b => b.keyword == keyword.toLowerCase());
    }
}
exports.default = TudeApi;
TudeApi.badges = [];
// fetch(this.baseurl + this.endpoints.club.users + id, {
//     method: 'post',
//     body:    JSON.stringify(body),
//     headers: { 'Content-Type': 'application/json' },
// })
//# sourceMappingURL=tudeapi.js.map