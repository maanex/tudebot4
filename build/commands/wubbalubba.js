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
const types_1 = require("../types/types");
class WubbaLubbaDubDubCommand extends types_1.Command {
    constructor() {
        super({
            name: 'wubbalubbadubdub',
            description: 'JEEZ RICK',
            groups: ['fun', 'club', 'easteregg'],
            hideOnHelp: true
        });
    }
    execute(channel, _user, _args, event, _repl) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield channel.guild.roles.fetch('496377983494258689');
            if (!role)
                return false;
            if (event.message.member.roles.resolve(role.id))
                event.message.member.roles.remove(role);
            else
                event.message.member.roles.add(role);
            return true;
        });
    }
}
exports.default = WubbaLubbaDubDubCommand;
//# sourceMappingURL=wubbalubba.js.map