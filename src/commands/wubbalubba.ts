import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";


module.exports = {

    name: 'wubbalubbadubdub',
    aliases: [ ],
    desc: 'JEEZ RICK',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void): boolean {
        let role = mes.guild.roles.find(r => r.id == '496377983494258689');
        if (!role) return false;

        if (mes.member.roles.find(r => r.id == role.id)) mes.member.removeRole(role);
        else mes.member.addRole(role);
        return true;
    }

}