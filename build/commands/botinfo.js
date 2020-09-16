"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
class BotInfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'botinfo',
            aliases: ['test1234'],
            description: 'Bot info',
            cooldown: 0,
            groups: [],
            sudoOnly: true,
        });
    }
    execute(channel, user, args, event, repl) {
        return true;
    }
}
exports.default = BotInfoCommand;
//# sourceMappingURL=botinfo.js.map