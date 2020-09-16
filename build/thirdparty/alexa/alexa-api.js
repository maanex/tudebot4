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
const axios_1 = require("axios");
const convert = require("xml-js");
/**
 * API wrapper for perspectiveapi.com
 * @author Maanex (maanex.me)
 */
class AlexaAPI {
    constructor(key) {
        this.key = key;
    }
    awis(url) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`https://awis.api.alexa.com/api?Action=UrlInfo&Count=10&ResponseGroup=Rank,LinksInCount&Start=1&Url=${url.host}`, {
                    headers: { 'x-api-key': this.key }
                });
                const json = JSON.parse(convert.xml2json(data, { compact: true, spaces: 0 }));
                console.log(JSON.stringify(json, null, 2));
                resolve(json);
            }
            catch (ex) {
                reject(ex);
            }
        }));
    }
}
exports.default = AlexaAPI;
//# sourceMappingURL=alexa-api.js.map