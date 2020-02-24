"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class OpenCommand extends types_1.Command {
    constructor(lang) {
        super('open', ['o',
            'unbox'], 'Open a lootbox', false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        repl('This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it');
        return true;
    }
}
exports.default = OpenCommand;
//# sourceMappingURL=open.js.map