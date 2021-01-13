"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const parse_args_1 = require("../util/parse-args");
const types_1 = require("../types/types");
class UInfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'uinfo',
            description: 'Userinfo',
            groups: ['club', 'internal'],
            hideOnHelp: true
        });
    }
    execute(channel, orgUser, args, event, repl) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmdl = parse_args_1.default.parse(args);
            let user = orgUser;
            if (event.message.mentions.users.size)
                user = event.message.mentions.users.first();
            if (cmdl['?'] || cmdl.help || cmdl._ === '?' || cmdl._ === 'help') {
                channel.send(`\`\`\`Options:
           --help  -?    shows this help page
--inventory --inv  -i    renders out the inventory
         --hidden  -h    shows hidden fields (like _org_ or _raw_)
            --all  -a    shows all fields (-i and -h combined)
\`\`\``);
            }
            try {
                const u = yield ((user === orgUser && cmdl._) ? tudeapi_1.default.clubUserById(cmdl._) : tudeapi_1.default.clubUserByDiscordId(user.id /*, orgUser */)); // Don't create a new profile on loopup
                if (!u || u.error) {
                    repl('User not found!', 'message', 'Or internal error, idk');
                    return false;
                }
                const out = JSON.parse(JSON.stringify(u));
                if (!cmdl.h && !cmdl.hidden && !cmdl.all && !cmdl.a) {
                    for (const index in out) {
                        if (index.charAt(0) === '_')
                            delete out[index];
                    }
                }
                if (!cmdl.i && !cmdl.inv && !cmdl.inventory && !cmdl.all && !cmdl.a) {
                    out.inventory = '.array.';
                    if (out._raw_inventory)
                        out._raw_inventory = '.array.';
                }
                let str = '```json\n' + JSON.stringify(out, null, 2) + '```';
                str = str.split('".array."').join('[ ... ]').split('".object."').join('{ ... }');
                if (str.length > 2000)
                    repl('The built message is too long. Consider not showing parts like the inventory or hidden atributes');
                else
                    repl(str);
                return true;
            }
            catch (err) {
                repl('An error occured!', 'bad');
                console.error(err);
                return false;
            }
        });
    }
}
exports.default = UInfoCommand;
//# sourceMappingURL=uinfo.js.map