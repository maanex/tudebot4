import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";


module.exports = {

    name: 'wubbalubbadubdub',
    aliases: [ ],
    desc: 'JEEZ RICK',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void) {
        let role = mes.guild.roles.find(r => r.id == '496377983494258689');
        if (!role) return;

        if (mes.member.roles.find(r => r.id == role.id)) mes.member.removeRole(role);
        else mes.member.addRole(role);
    }

}