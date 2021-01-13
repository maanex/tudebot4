"use strict";
/* eslint-disable no-return-assign */
/* eslint-disable no-extend-native */
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    static init() {
        Object.defineProperties(Array.prototype, {
            stack: {
                value() {
                    let out = 0;
                    this.forEach(e => out += e);
                    return out;
                }
            },
            count: {
                value(counter) {
                    let out = 0;
                    this.forEach(e => out += counter(e));
                    return out;
                }
            },
            iterate: {
                value(counter) {
                    let out;
                    this.forEach(e => out = counter(e, out));
                    return out;
                }
            }
        });
    }
}
exports.Util = Util;
exports.rand = max => Math.floor(Math.random() * max);
//# sourceMappingURL=util.js.map