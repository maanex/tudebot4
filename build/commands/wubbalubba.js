"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'wubbalubbadubdub',
    aliases: [],
    desc: 'JEEZ RICK',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        let role = mes.guild.roles.find(r => r.id == '496377983494258689');
        if (!role)
            return false;
        if (mes.member.roles.find(r => r.id == role.id))
            mes.member.removeRole(role);
        else
            mes.member.addRole(role);
        return true;
    }
};
//# sourceMappingURL=wubbalubba.js.map