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
 * @author Maanex (maanex.me)
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
                        languages,
                        doNotStore: true,
                        requestedAttributes: {
                            TOXICITY: {},
                            SEVERE_TOXICITY: {},
                            IDENTITY_ATTACK: {},
                            INSULT: {},
                            PROFANITY: {},
                            THREAT: {},
                            SEXUALLY_EXPLICIT: {},
                            FLIRTATION: {}
                        }
                    })
                });
                // eslint-disable-next-line prefer-promise-reject-errors
                if (!res.ok) {
                    reject(res.status + ' ' + res.statusText);
                }
                else {
                    const data = yield res.json();
                    resolve({
                        input,
                        toxicity: data.attributeScores.TOXICITY.summaryScore.value,
                        severeToxicity: data.attributeScores.SEVERE_TOXICITY.summaryScore.value,
                        identityAttack: data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
                        insult: data.attributeScores.INSULT.summaryScore.value,
                        profanity: data.attributeScores.PROFANITY.summaryScore.value,
                        threat: data.attributeScores.THREAT.summaryScore.value,
                        sexuallyExplicit: data.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value,
                        flirtation: data.attributeScores.FLIRTATION.summaryScore.value
                    });
                }
            }));
        });
    }
    log(res) {
        console.log(chalk `
{gray >>} {white ${res.input}}
{gray  Flirt:} {${res.flirtation < 0.5 ? 'white' : (res.flirtation > 0.8 ? 'red' : 'yellow')} ${res.flirtation.toFixed(4)} ${'░'.repeat(Math.floor(res.flirtation * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.flirtation * 10))}}
{gray Attack:} {${res.identityAttack < 0.5 ? 'white' : (res.identityAttack > 0.8 ? 'red' : 'yellow')} ${res.identityAttack.toFixed(4)} ${'░'.repeat(Math.floor(res.identityAttack * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.identityAttack * 10))}}
{gray Insult:} {${res.insult < 0.5 ? 'white' : (res.insult > 0.8 ? 'red' : 'yellow')} ${res.insult.toFixed(4)} ${'░'.repeat(Math.floor(res.insult * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.insult * 10))}}
{gray  Toxic:} {${res.toxicity < 0.5 ? 'white' : (res.toxicity > 0.8 ? 'red' : 'yellow')} ${res.toxicity.toFixed(4)} ${'░'.repeat(Math.floor(res.toxicity * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.toxicity * 10))}}
`);
    }
    logFull(res, extra = false) {
        const data = [
            ['Toxicity', res.toxicity],
            ['Severe Toxicity', res.severeToxicity],
            ['Identity Attack', res.identityAttack],
            ['Insult', res.insult],
            ['Profanity', res.profanity],
            ['Threat', res.threat],
            ['Sexually Explicit', res.sexuallyExplicit],
            ['Flirt', res.flirtation]
        ];
        if (extra) {
            data.push(...[
                ['Language Offence', Math.min(1, (res.toxicity + res.severeToxicity + res.insult + res.profanity) / 3.5)]
            ]);
        }
        this.logRaw(data, `{gray >>} {white ${res.input}}`);
    }
    logRaw(input, title) {
        const maxlength = input.map(i => i[0].length).reduce((a, b) => Math.max(a, b), 0);
        const out = `\n${(title + '\n') || ''}${input.map(i => this.buildSingle(i[0].padStart(maxlength), i[1])).join('\n')}`;
        const print = [out];
        print.raw = [out];
        console.log(chalk(print));
    }
    buildSingle(name, value) {
        return `{gray ${name}} {${value < 0.5 ? 'white' : (value > 0.8 ? 'red' : 'yellow')} ${value.toFixed(4)} ${'░'.repeat(Math.floor(value * 10))}}{gray ${'░'.repeat(10 - Math.floor(value * 10))}}`;
    }
}
exports.default = PerspectiveAPI;
PerspectiveAPI.DEFAULT_SETTINGS = {
    discoveryurl: 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze',
    headers: {},
    languages: ['en']
};
PerspectiveAPI.requestQueue = null;
//# sourceMappingURL=perspective-api.js.map