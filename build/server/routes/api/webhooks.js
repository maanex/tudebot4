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
const express_1 = require("express");
const rateLimiter_1 = require("../../rateLimiter");
const index_1 = require("../../../index");
exports.router = express_1.Router();
exports.router.post('/webhooks', rateLimiter_1.default.limit(100, 1), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = req.headers ? (req.headers.authorization || req.headers['proxy-authorization']) : undefined;
    if (!auth || !index_1.TudeBot.config.thirdparty.topgg.webhookauth.includes(auth)) {
        res.status(401).send('401 Unauthorized');
        return;
    }
    if (req.body.bot === '672822334641537041') {
        index_1.TudeBot.getModule('externalrewards').reward('freestuffbot.upvote', yield index_1.TudeBot.users.fetch(req.body.user), { topgg_url: 'https://top.gg/bot/672822334641537041?source=' + req.body.user });
    }
    res.status(200).send('Thank you');
}));
//# sourceMappingURL=webhooks.js.map