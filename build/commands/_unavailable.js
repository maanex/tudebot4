"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
class UnavailableCommand extends types_1.Command {
    constructor() {
        super({
            name: '_unavailable',
            description: 'Default command for when a command is unavailable.',
            hideOnHelp: true,
        });
    }
    execute(channel, user, args, event, repl) {
        repl('This command has been disabled.', 'bad');
        return true;
    }
}
exports.default = UnavailableCommand;
//# sourceMappingURL=_unavailable.js.map