import axios from 'axios';
import * as convert from 'xml-js';


export interface AnalyzerResponse {
}

/**
 * API wrapper for perspectiveapi.com
 * @author Maanex (maanex.me)
 */
export default class AlexaAPI {

  constructor (
    private key: string,
  ) { }

  public awis(url: URL): Promise<AnalyzerResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get(`https://awis.api.alexa.com/api?Action=UrlInfo&Count=10&ResponseGroup=Rank,LinksInCount&Start=1&Url=${url.host}`, {
          headers: { 'x-api-key': this.key }
        });
        const json: AnalyzerResponse = JSON.parse(convert.xml2json(data, {compact: true, spaces: 0}));
        console.log(JSON.stringify(json,null,2));
        resolve(json);
      } catch (ex) {
        reject(ex);
      }
    });
  }

}