"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class SourcecodeCommand extends types_1.Command {
    constructor(lang) {
        super('sourcecode', [], "A link to the Bot's source code.", 0, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        repl('The TudeBot is open source:', 'message', 'https://github.com/Maanex/tudebot4');
        return true;
    }
}
exports.default = SourcecodeCommand;
//# sourceMappingURL=sourcecode.js.map