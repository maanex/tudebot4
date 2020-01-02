"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    constructor() { }
    static init() {
        Object.defineProperties(Array.prototype, {
            stack: {
                value: function () {
                    let out = 0;
                    this.forEach(e => out += e);
                    return out;
                }
            }
        });
    }
}
exports.Util = Util;
exports.rand = max => Math.floor(Math.random() * max);
//# sourceMappingURL=util.js.map