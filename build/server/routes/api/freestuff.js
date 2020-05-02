"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimiter_1 = require("../../rateLimiter");
const index_1 = require("../../../index");
exports.router = express_1.Router();
exports.router.post("/freestuff", rateLimiter_1.default.limit(100, 1), (req, res, next) => {
    const auth = req.headers ? (req.headers.authorization || req.headers["proxy-authorization"]) : undefined;
    if (!auth || !index_1.TudeBot.config.thirdparty.freestuff.webhookauth.includes(auth)) {
        res.status(401).send('401 Unauthorized');
        return;
    }
    const module = index_1.TudeBot.getModule('freestuffassistant');
    if (!module)
        return;
    module.on(req.body.event, req.body.data);
    res.status(200).send('Thank you');
});
//# sourceMappingURL=freestuff.js.map