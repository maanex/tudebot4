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
const index_1 = require("index");
const node_fetch_1 = require("node-fetch");
class UserStalker {
    constructor() { }
    //
    static getInfo(user) {
        return null;
    }
    //
    static rawDiscordProfile(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield node_fetch_1.default(`https://discordapp.com/api/v7/users/${userid}`, {
                headers: { 'Authorization': `Bot ${index_1.TudeBot.token}` }
            }).then((res) => res.json());
        });
    }
}
exports.default = UserStalker;
//# sourceMappingURL=userStalker.js.map