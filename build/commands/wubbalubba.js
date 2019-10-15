"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'wubbalubbadubdub',
    aliases: [],
    desc: 'Bot info',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        let role = mes.guild.roles.find(r => r.id == '496377983494258689');
        if (!role)
            return;
        if (mes.member.roles.find(r => r.id == role.id))
            mes.member.removeRole(role);
        else
            mes.member.addRole(role);
    }
};
//# sourceMappingURL=wubbalubba.js.map