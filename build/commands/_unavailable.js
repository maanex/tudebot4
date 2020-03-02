"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class UnavailableCommand extends types_1.Command {
    constructor(lang) {
        super('_unavailable', [], 'Default command for when a command is unavailable.', 0, false, true, lang);
    }
    execute(channel, user, args, event, repl) {
        repl('This command has been disabled.', 'bad');
        return true;
    }
}
exports.default = UnavailableCommand;
//# sourceMappingURL=_unavailable.js.map