"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class WubbaLubbaDubDubCommand extends types_1.Command {
    constructor() {
        super({
            name: 'wubbalubbadubdub',
            description: 'JEEZ RICK',
            groups: ['fun', 'club', 'easteregg'],
            hideOnHelp: true,
        });
    }
    execute(channel, user, args, event, repl) {
        const role = channel.guild.roles.find(r => r.id == '496377983494258689');
        if (!role)
            return false;
        if (event.message.member.roles.find(r => r.id == role.id))
            event.message.member.removeRole(role);
        else
            event.message.member.addRole(role);
        return true;
    }
}
exports.default = WubbaLubbaDubDubCommand;
//# sourceMappingURL=wubbalubba.js.map