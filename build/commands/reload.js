"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
class ReloadCommand extends types_1.Command {
    constructor() {
        super({
            name: 'reload',
            description: 'Reload',
            sudoOnly: true,
            groups: ['internal'],
        });
    }
    execute(channel, user, args, event, repl) {
        tudeapi_1.default.reload();
        index_1.TudeBot.reload().then(() => event.message.react('✅')).catch();
        return true;
    }
}
exports.default = ReloadCommand;
//# sourceMappingURL=reload.js.map