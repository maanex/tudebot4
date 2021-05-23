import { User, TextChannel } from 'discord.js'
import { TudeBot } from 'index'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class BanCommand extends Command {

  private static readonly BAN_CREDIT_MAX_AMOUNT = 10
  private static banCredit: Map<string, number> = new Map()
  private static banCreditRefiller: any = null

  constructor() {
    super({
      name: 'ban',
      description: 'Ban someone',
      hideOnHelp: true,
      groups: [ 'moderation' ]
    })

    if (BanCommand.banCreditRefiller)
      clearTimeout(BanCommand.banCreditRefiller)
    BanCommand.banCreditRefiller = setTimeout(() => {
      for (const user of BanCommand.banCredit.keys()) {
        BanCommand.banCredit.set(user, BanCommand.banCredit.get(user) + 1)
        if (BanCommand.banCredit.get(user) >= BanCommand.BAN_CREDIT_MAX_AMOUNT)
          BanCommand.banCredit.delete(user)
      }
    }, 1000 * 60 * 60)
  }

  private getBanCredit(user: User): number {
    return BanCommand.banCredit.has(user.id)
      ? BanCommand.banCredit.get(user.id)
      : BanCommand.BAN_CREDIT_MAX_AMOUNT
  }

  private useBanCredit(user: User) {
    return BanCommand.banCredit.has(user.id)
      ? BanCommand.banCredit.set(user.id, BanCommand.banCredit.get(user.id) - 1)
      : BanCommand.banCredit.set(user.id, BanCommand.BAN_CREDIT_MAX_AMOUNT - 1)
  }

  public execute(_channel: TextChannel, _user: User, _args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    // TODO check if user has the permissions

    if (!event.message.mentions.users.size) {
      repl('Must mention a user!', 'bad', 'See, I cannot ban everyone here, you\'ll have to tell me who to ban.')
      return false
    }
    // const member = event.message.mentions.members.first()
    // const reason = args.join(' ').replace(member.toString(), '').replace('  ', '')

    // TODO check if user is ban immune

    // member.ban({ reason: `Mod: ${user.username} (${user.id})\nReason: ${reason}` })
    // repl(':+1:', 'success', 'The ban hammer was put to good use!')
    // TudeBot.modlog(channel.guild, 'punish', `${user.toString()} banned ${member.toString()} for reason: ${reason}`, 'high')

    return true
  }

}
