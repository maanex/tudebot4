"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
module.exports = {
    name: 'eval',
    aliases: [],
    desc: 'Eval',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        if (mes.author.id !== '137258778092503042')
            return false;
        try {
            let tapi = tudeapi_1.default;
            tudeapi_1.default.clubUserByDiscordId(mes.author.id).then(self => {
                repl(mes.channel, mes.author, eval(args.join(' ')));
            }).catch(ex => {
                repl(mes.channel, mes.author, eval(args.join(' ')));
            });
            return true;
        }
        catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'message', '```' + ex + '```');
            return false;
        }
    }
};
//# sourceMappingURL=eval.js.map