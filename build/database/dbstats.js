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
const database_1 = require("./database");
class DbStats {
    static getCommand(name) {
        return new DbStatCommand(name).load();
    }
    static getUser(user) {
        return new DbStatUser(user).load();
    }
}
exports.DbStats = DbStats;
class DbStatCommand {
    constructor(name) {
        this.name = name;
        this.raw = {};
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield database_1.default
                .collection('stats-commands')
                .findOne({ _id: this.name });
            for (const temp in c)
                this.raw[temp] = c[temp];
            return this;
        });
    }
    get calls() {
        return new DbStatGraph('stats-commands', { _id: this.name }, 'calls', this.raw.calls, this.raw);
    }
    get executions() {
        return new DbStatGraph('stats-commands', { _id: this.name }, 'executions', this.raw.executions, this.raw);
    }
}
exports.DbStatCommand = DbStatCommand;
class DbStatUser {
    constructor(user) {
        this.user = user;
        this.raw = {};
    }
    load(secondTry = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield database_1.default
                .collection('stats-users')
                .findOne({ _id: this.user.id });
            if (!c) {
                if (secondTry)
                    return this;
                yield database_1.default
                    .collection('stats-users')
                    .insertOne({
                    _id: this.user.id,
                    messagesSent: 0,
                    memesSent: 0,
                    dailiesClaimed: 0
                });
                return this.load(true);
            }
            for (const temp in c)
                this.raw[temp] = c[temp];
            return this;
        });
    }
    setValue(set) {
        database_1.default
            .collection('stats-users')
            .updateOne({ _id: this.user.id }, { $set: set });
    }
    get messagesSent() {
        return this.raw.messagesSent || 0;
    }
    set messagesSent(number) {
        this.raw.messagesSent = number;
        this.setValue({ messagesSent: number });
    }
    get memesSent() {
        return this.raw.memesSent || 0;
    }
    set memesSent(number) {
        this.raw.memesSent = number;
        this.setValue({ memesSent: number });
    }
    get dailiesClaimed() {
        return this.raw.dailiesClaimed || 0;
    }
    set dailiesClaimed(number) {
        this.raw.dailiesClaimed = number;
        this.setValue({ dailiesClaimed: number });
    }
}
exports.DbStatUser = DbStatUser;
class DbStatGraph {
    constructor(_collectionname, _dbquery, _objectid, raw, _fullraw) {
        this._collectionname = _collectionname;
        this._dbquery = _dbquery;
        this._objectid = _objectid;
        this.raw = raw;
        this._fullraw = _fullraw;
    }
    get today() {
        if (!this.raw)
            return 0;
        return this.raw[getDayId()] || 0;
    }
    update(dayId, value, delta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dayId < 0)
                return;
            if (this.raw) {
                let obj = {};
                obj[`${this._objectid}.${dayId}`] = value;
                if (delta)
                    obj = { $inc: obj };
                else
                    obj = { $set: obj };
                if (dayId > this.raw.length) {
                    if (!obj.$set)
                        obj.$set = {};
                    while (dayId-- > this.raw.length)
                        obj.$set[`${this._objectid}.${dayId}`] = 0;
                }
                return yield database_1.default
                    .collection(this._collectionname)
                    .updateOne(this._dbquery, obj);
            }
            else {
                const parentExists = Object.keys(this._fullraw).length > 0;
                const obj = parentExists ? {} : this._dbquery;
                obj[this._objectid] = [];
                for (let i = 0; i < dayId; i++)
                    obj[this._objectid].push(0);
                obj[this._objectid].push(value);
                if (parentExists) {
                    return yield database_1.default
                        .collection(this._collectionname)
                        .updateOne(this._dbquery, { $set: obj });
                }
                else {
                    this._fullraw[this._objectid] = obj;
                    return yield database_1.default
                        .collection(this._collectionname)
                        .insertOne(obj);
                }
            }
        });
    }
    updateToday(value, delta = true) {
        this.update(getDayId(), value, delta);
    }
}
exports.DbStatGraph = DbStatGraph;
function getDayId() {
    const now = new Date();
    const start = new Date(2020, 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day - 1; // index 0 on 1st january
}
//# sourceMappingURL=dbstats.js.map