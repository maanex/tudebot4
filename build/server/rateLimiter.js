"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimit = require("express-rate-limit");
class RateLimiter {
    static limit(max, window, mes) {
        return rateLimit({
            windowMs: window * 60 * 1000,
            max: max,
            message: mes ? JSON.stringify(mes) : null,
        });
    }
}
exports.default = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map