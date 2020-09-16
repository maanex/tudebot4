"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
class SourcecodeCommand extends types_1.Command {
    constructor() {
        super({
            name: 'sourcecode',
            description: "A link to the Bot's source code.",
            groups: ['info'],
        });
    }
    execute(channel, user, args, event, repl) {
        repl('The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4');
        return true;
    }
}
exports.default = SourcecodeCommand;
//# sourceMappingURL=sourcecode.js.map