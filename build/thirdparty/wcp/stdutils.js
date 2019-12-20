"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hook_stdout(callback) {
    var old_write = process.stdout.write;
    // @ts-ignore
    process.stdout.write = (function (write) {
        return function (string, encoding, fd) {
            write.apply(process.stdout, arguments);
            callback(string, encoding, fd);
        };
    })(process.stdout.write);
    return function () {
        process.stdout.write = old_write;
    };
}
exports.hook_stdout = hook_stdout;
//# sourceMappingURL=stdutils.js.map