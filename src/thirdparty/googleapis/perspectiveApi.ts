
import fetch, { Response } from 'node-fetch';
import * as chalk from 'chalk';


export interface PerspectiveAPIInitSettings {
  discoveryurl?: string,
  headers?: any,
  languages?: string[];
}

export interface AnalyzerResponse {
  input: string;
  toxicity: number;
  identityAttack: number;
  insult: number;
  threat: number;
  flirtation: number;
}

/**
 * API wrapper for perspectiveapi.com
 * @author Maanex (maanex.tk)
 */
export default class PerspectiveAPI {

  public static readonly DEFAULT_SETTINGS = {
    discoveryurl: 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze',
    headers: { },
    languages: [ 'en' ]
  }

  private static requestQueue: (()=>{})[] = null;

  //

  constructor (
    private key: string,
    private settings?: PerspectiveAPIInitSettings,
  ) {
    if (!this.settings) {
      this.settings = PerspectiveAPI.DEFAULT_SETTINGS;
    } else {
      if (!this.settings.discoveryurl) this.settings.discoveryurl = PerspectiveAPI.DEFAULT_SETTINGS.discoveryurl;
      if (!this.settings.headers) this.settings.headers = PerspectiveAPI.DEFAULT_SETTINGS.headers;
      if (!this.settings.languages) this.settings.languages = PerspectiveAPI.DEFAULT_SETTINGS.languages;
    }

    this.settings.headers['Content-Type'] = 'application/json';

    if (!PerspectiveAPI.requestQueue) {
      PerspectiveAPI.requestQueue = [];
      setInterval(() => PerspectiveAPI.requestQueue.length&&PerspectiveAPI.requestQueue.splice(0, 1)[0](), 1000);
    }
  }

  public analyze(input: string, languages?: string[]): Promise<AnalyzerResponse> {
    return new Promise((resolve, reject) => {
      PerspectiveAPI.requestQueue.push(async () => {
        const res = await fetch(`${this.settings.discoveryurl}?key=${this.key}`, {
          method: 'POST',
          headers: this.settings.headers,
          body: JSON.stringify({
            comment: { text: input },
            languages: languages,// || this.settings.languages,
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
        if (!res.ok) reject(res.status + ' ' + res.statusText);
        else {
          const data = await res.json();
          resolve({
            input: input,
            toxicity: data.attributeScores.TOXICITY.summaryScore.value,
            identityAttack: data.attributeScores.IDENTITY_ATTACK.summaryScore.value,
            insult: data.attributeScores.INSULT.summaryScore.value,
            threat: data.attributeScores.THREAT.summaryScore.value,
            flirtation: data.attributeScores.FLIRTATION.summaryScore.value,
          });
        }
      });
    });
  }

  public log(res: AnalyzerResponse) {
    console.log(chalk`
{gray >>} {white ${res.input}}
{gray  Flirt:} {${res.flirtation < .5 ? 'white' : (res.flirtation > .8 ? 'red' : 'yellow')} ${res.flirtation.toFixed(4)} ${'░'.repeat(Math.floor(res.flirtation * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.flirtation * 10))}}
{gray Attack:} {${res.identityAttack < .5 ? 'white' : (res.identityAttack > .8 ? 'red' : 'yellow')} ${res.identityAttack.toFixed(4)} ${'░'.repeat(Math.floor(res.identityAttack * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.identityAttack * 10))}}
{gray Insult:} {${res.insult < .5 ? 'white' : (res.insult > .8 ? 'red' : 'yellow')} ${res.insult.toFixed(4)} ${'░'.repeat(Math.floor(res.insult * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.insult * 10))}}
{gray  Toxic:} {${res.toxicity < .5 ? 'white' : (res.toxicity > .8 ? 'red' : 'yellow')} ${res.toxicity.toFixed(4)} ${'░'.repeat(Math.floor(res.toxicity * 10))}}{gray ${'░'.repeat(10 - Math.floor(res.toxicity * 10))}}
`);
  }

}