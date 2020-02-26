"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class BotInfoCommand extends types_1.Command {
    constructor(lang) {
        super('botinfo', ['test1234'], 'Bot info', 0, true, false, lang);
    }
    execute(channel, user, args, event, repl) {
        return true;
    }
}
exports.default = BotInfoCommand;
//# sourceMappingURL=botinfo.js.map