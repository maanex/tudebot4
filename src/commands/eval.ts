import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class EvalCommand extends Command {

  constructor() {
    super({
      name: 'eval',
      description: 'Eval',
      sudoOnly: true,
      groups: [ 'internal' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (user.id !== '137258778092503042') return false;

    try {
      let tapi = TudeApi;
      TudeApi.clubUserByDiscordId(user.id).then(self => {
        repl(eval(args.join(' ')));
      }).catch(ex => {
        repl(eval(args.join(' ')));
      });
      return true;
    } catch (ex) {
      repl('Error:', 'message', '```' + ex + '```');
      return false;
    }
  }

}
