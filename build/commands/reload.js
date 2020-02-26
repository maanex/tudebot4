"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
class ReloadCommand extends types_1.Command {
    constructor(lang) {
        super('reload', [], 'Reload', 0, true, false, lang);
    }
    execute(channel, user, args, event, repl) {
        tudeapi_1.default.reload();
        index_1.TudeBot.reload().then(() => event.message.react('✅')).catch();
        return true;
    }
}
exports.default = ReloadCommand;
//# sourceMappingURL=reload.js.map