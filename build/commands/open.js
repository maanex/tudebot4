"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
class OpenCommand extends types_1.Command {
    constructor() {
        super({
            name: 'open',
            aliases: ['o', 'unbox'],
            description: 'Open a lootbox',
            groups: ['club']
        });
    }
    execute(_channel, _user, _args, _event, repl) {
        repl('This command is not yet available!', 'message', '~~We\'re~~ **I am** working on it');
        return true;
    }
}
exports.default = OpenCommand;
//# sourceMappingURL=open.js.map