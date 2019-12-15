"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
module.exports = {
    name: 'reload',
    aliases: [],
    desc: 'Reload',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        tudeapi_1.default.reload();
        mes.react('✅');
    }
};
//# sourceMappingURL=reload.js.map