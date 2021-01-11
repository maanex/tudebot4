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
const node_fetch_1 = require("node-fetch");
/**
 * API wrapper for api.badosz.com
 * @author Maanex (maanex.tk)
 */
class BadoszAPI {
    //
    constructor(token, settings) {
        this.token = token;
        this.settings = settings;
        if (!this.settings) {
            this.settings = BadoszAPI.DEFAULT_SETTINGS;
        }
        else {
            if (!this.settings.baseurl)
                this.settings.baseurl = BadoszAPI.DEFAULT_SETTINGS.baseurl;
            if (!this.settings.headers)
                this.settings.headers = BadoszAPI.DEFAULT_SETTINGS.headers;
        }
        this.settings.headers['Authorization'] = token;
    }
    makeRequest(endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const add = [];
            for (const key in params)
                add.push(`${key}=${encodeURIComponent(params[key])}`);
            return node_fetch_1.default(this.settings.baseurl + endpoint + (add.length ? `?${add.join('&')}` : ''), {
                method: 'GET',
                headers: this.settings.headers
            });
        });
    }
    //
    getAnt() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.ant);
            return res.buffer();
        });
    }
    getBird() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.bird);
            return res.buffer();
        });
    }
    getBee() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.bee);
            return res.buffer();
        });
    }
    getRabbit() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.rabbit);
            return res.buffer();
        });
    }
    getCatgirl() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.catgirl);
            return res.buffer();
        });
    }
    getCuddle() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.cuddle);
            return res.buffer();
        });
    }
    getDog() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.dog);
            return res.buffer();
        });
    }
    getFeed() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.feed);
            return res.buffer();
        });
    }
    getFox() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.fox);
            return res.buffer();
        });
    }
    getHug() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.hug);
            return res.buffer();
        });
    }
    getJesus() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.jesus);
            return res.buffer();
        });
    }
    getKiss() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.kiss);
            return res.buffer();
        });
    }
    getPat() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.pat);
            return res.buffer();
        });
    }
    getPoke() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.poke);
            return res.buffer();
        });
    }
    getShibe() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.shibe);
            return res.buffer();
        });
    }
    getTickle() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.tickle);
            return res.buffer();
        });
    }
    getAdvice() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.advice);
            return (yield res.json()).advice;
        });
    }
    getCat() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.cat);
            return res.buffer();
        });
    }
    getCuckNorris() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.chucknorris);
            return (yield res.json()).joke;
        });
    }
    getDadJoke() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.dadjoke);
            return (yield res.json()).joke;
        });
    }
    getFact() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.fact);
            return (yield res.json()).fact;
        });
    }
    getWhy() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.why);
            return (yield res.json()).why;
        });
    }
    getYoMomma() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.yomomma);
            return (yield res.json()).joke;
        });
    }
    toBase64(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.base64, { text: text });
            return (yield res.json()).formatted;
        });
    }
    toBinary(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.binary, { text: text });
            return (yield res.json()).formatted;
        });
    }
    makeBlurple(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.blurple, { url: imageUrl });
            return res.buffer();
        });
    }
    getChangeMyMind(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.changemymind, { text: text });
            return res.buffer();
        });
    }
    getColor(color) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.color, {
                hex: ('number' == typeof color) ? color.toString(16).padStart(6, '0') : color
            });
            return res.buffer();
        });
    }
    colorify(imageUrl, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.colorify, {
                url: imageUrl,
                hex: ('number' == typeof color) ? color.toString(16).padStart(6, '0') : color
            });
            return res.buffer();
        });
    }
    fromBase64(base64) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.decodeBase64, { text: base64 });
            return (yield res.json()).formatted;
        });
    }
    fromBinary(binary) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.decodeBase64, { text: binary });
            return (yield res.json()).formatted;
        });
    }
    /** @deprecated use BadoszAPI.ENDPOINTS instead */
    getEndpoints() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.endpoints);
            return (yield res.json()).endpoints;
        });
    }
    getExcuseme(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.excuseme, { text: text });
            return res.buffer();
        });
    }
    flipText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.flip, { text: text });
            return (yield res.json()).formatted;
        });
    }
    toHex(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.hex, { text: text });
            return (yield res.json()).formatted;
        });
    }
    invertImage(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.invert, { url: imageUrl });
            return res.buffer();
        });
    }
    toMorseCode(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.morse, { text: text });
            return (yield res.json()).formatted;
        });
    }
    reverseText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.reverse, { text: text });
            return (yield res.json()).formatted;
        });
    }
    getSteamUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.steamUser, { id: id });
            const out = yield res.json();
            out.created = new Date(out.created * 1000);
            out.last_log_off = new Date(out.last_log_off * 1000);
            return out;
        });
    }
    getTrumpTweet(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.trump, { text: text });
            return res.buffer();
        });
    }
    toVaporwave(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.vaporwave, { text: text });
            return (yield res.json()).formatted;
        });
    }
    getWanted(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.wanted, { url: imageUrl });
            return res.buffer();
        });
    }
    getWasted(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.makeRequest(BadoszAPI.ENDPOINTS.wasted, { url: imageUrl });
            return res.buffer();
        });
    }
}
exports.default = BadoszAPI;
BadoszAPI.DEFAULT_SETTINGS = {
    baseurl: 'https://api.badosz.com/',
    headers: {},
};
BadoszAPI.ENDPOINTS = {
    ant: 'ant',
    bird: 'bird',
    bee: 'bee',
    rabbit: 'rabbit',
    catgirl: 'catgirl',
    cuddle: 'cuddle',
    dog: 'dog',
    feed: 'feed',
    fox: 'fox',
    hug: 'hug',
    jesus: 'jesus',
    kiss: 'kiss',
    pat: 'pat',
    poke: 'poke',
    shibe: 'shibe',
    tickle: 'tickle',
    advice: 'advice',
    cat: 'cat',
    chucknorris: 'chucknorris',
    dadjoke: 'dadjoke',
    fact: 'fact',
    why: 'why',
    yomomma: 'yomomma',
    base64: 'base64',
    binary: 'binary',
    blurple: 'blurple',
    changemymind: 'changemymind',
    color: 'color',
    colorify: 'colorify',
    decodeBase64: 'decode-base64',
    decodeHex: 'decode-hex',
    endpoints: 'endpoints',
    excuseme: 'excuseme',
    flip: 'flip',
    hex: 'hex',
    invert: 'invert',
    morse: 'morse',
    reverse: 'reverse',
    steamUser: 'steam-user',
    trump: 'trump',
    vaporwave: 'vaporwave',
    wanted: 'wanted',
    wasted: 'wasted',
};
//# sourceMappingURL=badosz-api.js.map