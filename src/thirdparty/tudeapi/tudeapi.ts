
const fetch = require('node-fetch');


const settings = require('../../../config/settings.json');


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

export default class TudeApi {

    public static get baseurl() {
        return settings.thirdparty.tudeapi.baseurl;
    }
    
    public static get key() {
        return settings.thirdparty.tudeapi.key;
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
            .then(o => this.badges = o)
            .catch(console.error);
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

    public static userByDiscordId(id: string):Promise<User> {
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
                    resolve(o);
                })
                .catch(err => reject(err));
        });
    }

    public static clubUserByDiscordId(id: string):Promise<ClubUser> {
        return new Promise((resolve, reject) => {
            fetch(this.baseurl + this.endpoints.club.users + 'find?discord=' + id, {
                method: 'get',
                headers: { 'auth': this.key },
            })
                .then(o => o.json())
                .then(o => {
                    o['_org_points'] = o['points'];
                    o['_org_cookies'] = o['cookies'];
                    o['_org_gems'] = o['gems'];
                    resolve(o);
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

}