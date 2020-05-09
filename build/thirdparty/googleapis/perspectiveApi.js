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
const chalk = require("chalk");
/**
 * API wrapper for perspectiveapi.com
 * @author Maanex (maanex.tk)
 */
class PerspectiveAPI {
    //
    constructor(key, settings) {
        this.key = key;
        this.settings = settings;
        if (!this.settings) {
            this.settings = PerspectiveAPI.DEFAULT_SETTINGS;
        }
        else {
            if (!this.settings.discoveryurl)
                this.settings.discoveryurl = PerspectiveAPI.DEFAULT_SETTINGS.discoveryurl;
            if (!this.settings.headers)
                this.settings.headers = PerspectiveAPI.DEFAULT_SETTINGS.headers;
            if (!this.settings.languages)
                this.settings.languages = PerspectiveAPI.DEFAULT_SETTINGS.languages;
        }
        this.settings.headers['Content-Type'] = 'application/json';
        if (!PerspectiveAPI.requestQueue) {
            PerspectiveAPI.requestQueue = [];
            setInterval(() => PerspectiveAPI.requestQueue.length && PerspectiveAPI.requestQueue.splice(0, 1)[0](), 1000);
        }
    }
    analyze(input, languages) {
        return new Promise((resolve, reject) => {
            PerspectiveAPI.requestQueue.push(() => __awaiter(this, void 0, void 0, function* () {
                const res = yield node_fetch_1.default(`${this.settings.discoveryurl}?key=${this.key}`, {
                    method: 'POST',
                    headers: this.settings.headers,
                    body: JSON.stringify({
                        comment: { text: input },
                        languages: languages,
                        doNotStore: true,
                        requestedAttributes: {
                            TOXICITY: {},
                            // SEVERE_TOXICITY: {},
                            IDENTITY_ATTACK: {},
                            INSULT: {},
                            // PROFANITY: {},
                            THREAT: {},
                            // SEXUALLY_EXPLICIT: {},
                            FLIRTATION: {},
                        }
                    })
                });
                if (!res.ok)
                    reject(res.status + ' ' + res.statusText);
                else {
                    const data = yield res.json();
                    resolve({
                        input: input,
                        toxicity: data.attributeScores.TOXICITY.summaryScore.value,
                        identityAttack: data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
                        insult: data.attributeScores.INSULT.summaryScore.value,
                        threat: data.attributeScores.THREAT.summaryScore.value,
                        flirtation: data.attributeScores.FLIRTATION.summaryScore.value,
                    });
                }
            }));
        });
    }
    log(res) {
        console.log(chalk `
{gray >>} {white ${res.input}}
{gray  Flirt:} {${res.flirtation < .5 ? 'white' : (res.flirtation > .8 ? 'red' : 'yellow')} ${res.flirtation.toFixed(4)} ${'░'.repeat(Math.floor(res.flirtation * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.flirtation * 10))}}
{gray Attack:} {${res.identityAttack < .5 ? 'white' : (res.identityAttack > .8 ? 'red' : 'yellow')} ${res.identityAttack.toFixed(4)} ${'░'.repeat(Math.floor(res.identityAttack * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.identityAttack * 10))}}
{gray Insult:} {${res.insult < .5 ? 'white' : (res.insult > .8 ? 'red' : 'yellow')} ${res.insult.toFixed(4)} ${'░'.repeat(Math.floor(res.insult * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.insult * 10))}}
{gray  Toxic:} {${res.toxicity < .5 ? 'white' : (res.toxicity > .8 ? 'red' : 'yellow')} ${res.toxicity.toFixed(4)} ${'░'.repeat(Math.floor(res.toxicity * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.toxicity * 10))}}
`);
    }
}
exports.default = PerspectiveAPI;
PerspectiveAPI.DEFAULT_SETTINGS = {
    discoveryurl: 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze',
    headers: {},
    languages: ['en']
};
PerspectiveAPI.requestQueue = null;
//# sourceMappingURL=perspectiveApi.js.map