import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";


const RESOUCES = {
  club: {

  },
  freestuff: {
    no_response: { title: 'FreeStuff Bot does not respond', url: 'https://tude.ga/freestuff/troubleshooting#noresponse' },
    no_permission: { title: 'FreeStuff Bot does not have required permissions', url: 'https://tude.ga/freestuff/troubleshooting#nopermission' },
  }
}

type resource = { title: string, url: string } | null;

export default class SupportCommand extends Command {

  constructor() {
    super({
      name: 'support',
      description: 'For the support team to quickly show relevant resources.',
      aliases: [ 'supp', 'sup' ],
      groups: [ 'info' ],
      hideOnHelp: true,
    });
  }

  public static readonly RESOUCES = RESOUCES;

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (!args.length) {
      repl('You need to further describe the issue', 'bad');
      return;
    }

    const keyword = args.splice(0, 1)[0].toLowerCase();
    const query = args.join(' ').toLowerCase();
    let out: resource = null;

    if (keyword.includes('club')) {
      out = this.findClubResource(query);
    } else if (keyword.includes('free') || keyword.includes('stuff')) {
      out = this.findFreeStuffResource(query);
    }

    if (!out) {
      repl('Nothing found!', 'bad', 'Perhaps check spelling');
      return false;
    }

    SupportCommand.sendSupportEmbed(out, channel);
    return true;
  }

  public static sendSupportEmbed(resource: resource, channel: TextChannel, recipient?: User) {
    channel.send({ embed: {
      color: 0x2f3136,
      author: recipient ? {
        name: `Hey, ${recipient.username}! I found something that might help you:`
      } : undefined,
      title: resource.title,
      url: resource.url,
      footer: { text: 'Click on the text above to open the support website!' }
    }});
  }

  private findClubResource(query: string): resource {

    return null;
  }

  private findFreeStuffResource(query: string): resource {
    if (query.includes('1')
    ||  query.includes('repl')
    ||  query.includes('response'))
      return RESOUCES.freestuff.no_response;

    if (query.includes('2')
    ||  query.includes('perm')
    ||  query.includes('access')
    ||  query.includes('allowed'))
      return RESOUCES.freestuff.no_permission;

    return null;
  }

}
