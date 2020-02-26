"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class BetaCommand extends types_1.Command {
    constructor(lang) {
        super('beta', [], 'Join the TudeBot Beta program', 0, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        repl('Click here to join the TudeBot Beta program', 'message', 'https://discord.gg/UPXM3Yu/');
        return true;
    }
}
exports.default = BetaCommand;
//# sourceMappingURL=beta.js.map