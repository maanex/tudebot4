"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const rateLimiter_1 = require("../../rateLimiter");
const index_1 = require("../../../index");
exports.router = express_1.Router();
exports.router.post("/webhooks", rateLimiter_1.default.limit(100, 1), (req, res, next) => {
    const auth = req.headers ? (req.headers.authorization || req.headers["proxy-authorization"]) : undefined;
    if (!auth || !index_1.TudeBot.config.thirdparty.topgg.webhookauth.includes(auth)) {
        res.status(401).send('401 Unauthorized');
        return;
    }
    if (req.body.bot == '672822334641537041') {
        index_1.TudeBot.getModule('externalrewards').reward('freestuffbot.upvote', index_1.TudeBot.users.get(req.body.user), { topgg_url: 'https://top.gg/bot/672822334641537041?source=' + req.body.user });
    }
    res.status(200).send('Thank you');
});
//# sourceMappingURL=webhooks.js.map