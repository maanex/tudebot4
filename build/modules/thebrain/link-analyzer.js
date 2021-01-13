"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ogs = require("open-graph-scraper");
const getUrls = require("get-urls");
class LinkAnalyzer {
    static rawMessage(message) {
        if (!message.content.includes('.'))
            return;
        const urls = getUrls(message.content);
        for (const link of urls)
            this.analyze(link);
    }
    static analyze(link) {
        console.log(`>> ${link}`);
        ogs({ url: link })
            .then((meta) => {
            console.log(meta.result);
        })
            .catch((err) => {
            console.error(err);
        });
        // TudeBot.alexaAPI.awis(new URL(link)); // TODO
    }
}
exports.default = LinkAnalyzer;
//# sourceMappingURL=link-analyzer.js.map