"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
class EvalCommand extends types_1.Command {
    constructor() {
        super({
            name: 'eval',
            description: 'Eval',
            sudoOnly: true,
            groups: ['internal'],
        });
    }
    execute(channel, user, args, event, repl) {
        if (user.id !== '137258778092503042')
            return false;
        try {
            let tapi = tudeapi_1.default;
            tudeapi_1.default.clubUserByDiscordId(user.id).then(self => {
                repl(eval(args.join(' ')));
            }).catch(ex => {
                repl(eval(args.join(' ')));
            });
            return true;
        }
        catch (ex) {
            repl('Error:', 'message', '```' + ex + '```');
            return false;
        }
    }
}
exports.default = EvalCommand;
//# sourceMappingURL=eval.js.map