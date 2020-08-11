import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";


export default class WubbaLubbaDubDubCommand extends Command {

  constructor() {
    super({
      name: 'wubbalubbadubdub',
      description: 'JEEZ RICK',
      groups: [ 'fun', 'club', 'easteregg' ],
      hideOnHelp: true,
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    const role = channel.guild.roles.find(r => r.id == '496377983494258689');
    if (!role) return false;
    
    if (event.message.member.roles.find(r => r.id == role.id)) event.message.member.removeRole(role);
    else event.message.member.addRole(role);
    return true;
  }

}
