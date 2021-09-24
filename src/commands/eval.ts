/* eslint-disable no-unused-vars */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, TextChannel } from 'discord.js'
import { Docker } from 'node-docker-api'
import { TudeBot } from '..'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class EvalCommand extends Command {

  private static docker = new Docker({ socketPath: '/var/run/docker.sock' })

  constructor() {
    super({
      name: 'eval',
      description: 'Eval',
      sudoOnly: true,
      aliases: [ 'evalr', '>', '>>' ],
      groups: [ 'internal' ]
    })
  }

  public async execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    if (user.id !== '137258778092503042') return false

    try {
      const reply = repl
      const guild = channel.guild
      const message = event.message
      const mes = event.message
      const msg = event.message
      const member = message.member
      const bot = TudeBot
      const self = TudeBot.user
      const core = TudeBot.user
      const docker = EvalCommand.docker

      const comm = (/((>>)|r)$/.test(event.label) ? 'return ' : '') + args.join(' ')
      const built = `(async () => { ${comm} })()`
      const res = await eval(built)
      channel.send(`\`\`\`${res}\`\`\``)
      return true
    } catch (ex) {
      repl('Error:', 'message', '```' + ex + '```')
      return false
    }
  }

}
