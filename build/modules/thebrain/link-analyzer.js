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
const ogs = require("open-graph-scraper");
const getUrls = require("get-urls");
class LinkAnalyzer {
    static rawMessage(message) {
        if (!message.content.includes('.'))
            return;
        const urls = getUrls(message.content);
        for (const link of urls) {
            this.analyze(link);
        }
    }
    static analyze(link) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`>> ${link}`);
            ogs({ url: link })
                .then(meta => {
                console.log(meta.result);
            })
                .catch(err => {
                console.error(err);
            });
            // TudeBot.alexaAPI.awis(new URL(link)); // TODO
        });
    }
}
exports.default = LinkAnalyzer;
//# sourceMappingURL=link-analyzer.js.map