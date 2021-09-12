/* eslint-disable no-labels */
import { User, TextChannel } from 'discord.js'
import { TudeBot } from '../index'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import CommandsModule from '../modules/commands'
import ParseArgs from '../lib/parse-args'
import Emojis from '../int/emojis'


export default class HelpCommand extends Command {

  private readonly _nopes = [
    'nope',
    'no',
    'not for you',
    'big no'
  ];

  private readonly _yeses = [
    'yes',
    'perhaps',
    'most likely',
    'I think so',
    'probably',
    'possibly'
  ];


  constructor() {
    super({
      name: 'help',
      aliases: [ ...('.?!/%-+=~&,:*_$'.split('').map(p => p + 'help')), 'commands', 'commandlist' ],
      description: 'Help!',
      groups: [ 'info' ],
      hideOnHelp: true
    })
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): boolean {
    if (args.length < 1) {
      let text = ''
      const cmdmodule = TudeBot.getModule<CommandsModule>('commands')
      let cmds = cmdmodule.getCommands().sort()

      if (!event.sudo) {
        const channelConfig = cmdmodule.getCommandChannelConfig(channel)
        cmds = cmds.filter(c => !c.sudoOnly && !c.hideOnHelp && channelConfig.execute)
        cmds = cmds.filter((c) => {
          channelConfig.execute = true
          return cmdmodule.doExecuteCommand(channelConfig, c)
        })
      }

      let longest = 0
      for (const cmd of cmds) {
        if (cmd.name.length > longest)
          longest = cmd.name.length
      }

      for (const cmd of cmds)
        text += `\`${((cmd.hideOnHelp ? '•' : '') + cmd.name).padStart(longest + 1)}\` ${cmd.sudoOnly ? ('**' + cmd.description + '**') : cmd.description.split('\n')[0]}\n` // wtf?


      repl('Help', 'message', text)
    } else {
      const cmdline = ParseArgs.parse(args)
      let cmd = args[0]

      if (cmdline.groups) {
        const out = {}
        for (const c of TudeBot.getModule<CommandsModule>('commands').getCommands()) {
          for (const g of c.groups) {
            if (out[g]) out[g]++
            else out[g] = 1
          }
        }
        const mes = []
        for (const key in out)
          mes.push(`**${key}** (${out[key]})`)
        repl('Command groups:', 'message', mes.join('\n'))
      } else if (cmd.startsWith('#')) {
        cmd += args.length >= 2 ? args[1] : ''
        let cmds = []
        for (const c of TudeBot.getModule<CommandsModule>('commands').getCommands()) {
          if (c.groups.includes(cmd.substr(1)))
            cmds.push(c)
        }
        cmds = cmds.map(c => `**${c.name}** *${c.groups.join(', ')}*`)
        repl(`Commands in group ${cmd}:`, 'message', cmds.join('\n'))
      } else {
        let command: Command
        out:
        for (const c of TudeBot.getModule<CommandsModule>('commands').getCommands()) {
          if (c.name === cmd) {
            command = c
            break out
          }
          for (const a of c.aliases) {
            if (a === cmd) {
              command = c
              break out
            }
          }
        }
        if (!command) {
          switch (cmd.toLowerCase()) {
            case 'me':
              channel.send(`I'm here for you ${user} :)`)
              break

            default:
              repl('UH...', 'bad', `Command ${cmd} not found!`)
          }
        } else if (command.name === 'help' && !event.sudo) {
          repl('Help', 'message', this.helphelp(user))
        } else {
          const fields = []
          if (command.cooldown)
            fields.push({ name: 'Cooldown', value: `${command.cooldown}s`, inline: true })

          if (command.groups)
            fields.push({ name: 'In Groups', value: command.groups.join(', '), inline: true })

          if (Math.random() < 0.1)
            fields.push({ name: 'Hotel', value: 'Trivago', inline: true })

          channel.send({
            embed: {
              title: command.name,
              description: command.description,
              fields: [
                {
                  name: 'Aliases',
                  value: command.aliases.length ? (command.aliases.join(', ') + Emojis.bigSpace.string) : `[${Emojis.bigSpace.string}](https://www.youtube.com/watch?v=cvh0nX08nRw)`,
                  inline: true
                },
                {
                  name: 'Allowed',
                  value: command.sudoOnly ? this._nopes[Math.floor(Math.random() * this._nopes.length)] : this._yeses[Math.floor(Math.random() * this._yeses.length)],
                  inline: true
                }, ...fields
              ]
            }
          })
        }
      }
    }
    return true
  }

  //

  private helphelpTexts = [
    'The requested page is not available',

    'Th̸e requeste̷d päge ̷is nót avaiIab̵le',

    'T̴h̸e̷ ̴r̶ḛ̷̑̌q̴u̶e̶s̸t̸e̷d̵̗̗͐ ̵p̶a̴g̸e̴ ̷i̵s̵ ̸n̸o̸t̵̺̗̏ ̶a̶v̵a̵i̴l̶a̷͓̾b̵l̷e̶',

    'T̸̝̔͒h̸͍̋ḙ̸͗ ̶̤͌r̸͈̻̉̑ḛ̷̑̌q̷͕̀ủ̸͉̐ė̵͇s̷̭̠̓̃t̸̖̣̂e̷̦̅d̵̗̗͐ ̷̻͛p̵̞͛͜a̵͍̔ģ̴̱̈́̕é̵̞ ̶̬̘́ḯ̴̯̳͘s̶̼͒̚ ̸̗̊̍n̴͖̠̏o̶̡͊t̵̺̗̏ ̴̛̣̟̆a̷̠͊͝ṿ̶̧̏a̷̜̕i̸̜̙͐͝l̵̗̟̿a̷͓̾b̴̦̺̍ľ̸̪͓̆ë̵̬̼̍',


    'T̴̡̨̛̬̥͕̪͖̜̻̰̮̳̖̣̳͔̻̥̬̟͙͑̓̿̾͊̌̽̀͌͋́̽́͛̈̅̀͆̎̊̆̏̊̌͊͘͜͝h̸̗̗͕̹̺̟̗͙̮̦̱̹͖͍̼͖̺̠̯̤͍̱͗̄̆͌̐̄̏̾͑̏͐̔͒̔̑͜͝͝ͅe̸̡̧͖̩̺̹̟͚̱̠͇̩͇̯̞̳͖̙̲͒͆̓̽̂̏̇̏͌͌̑͂̉̎̇͗͘͠͠ͅ ̴̛̤̝̰̩̳̪̗̝̘͓̬̰̩̊͑̋̇́̏r̸̲̙̪̭̱̪̪̲͖̩̲̮̜̖̭͎̃̑̐͌̈́̌͌͗̚͠͠e̴̡̢̨̧̛͓̫̲̱͖͉̺̞͂̆̈̌͊̀͆́̕͘̕q̴̮͍̠͖̱̼͉̹͎͕̝̝̮̱̻̪͔̦͈̯͈̘̹̟̗͈̜̠̪̼͚̙̝͐̿́͛͗̀͗̈̉̎́̾͂͒̌́̓͐́̓̌͋̑͗̔̅͑͗͌̀͝ͅͅų̶̛̞̺̺̣͖̱̹͔̠̦͇͉̘̐̏́̈́͗̌́͗̊̄̈́̋̐̒̿͆̃̈́͊͘͠è̴̫͉̬͙̀̈́̾̎̀͛̾̑̆̊̈́͐̒̎͆̀̃̉̚͘͠ŝ̶̡̨̧̡̳͓͈̙̖̭͚͚̺̱̩̪̲̣̳̯̭͈͚͚͖̠͇͑̂̀̅́̄̅͌̈̀̄̾͐͛͌̄̿͐̀̂̽̀͜͜͝t̶̢̨̗͖̩̯̹̯̫̠̙̪̠̝̖̼̟̭̠͓̝͍̠̥̙̣͓̟̜̞̩̰͐̾̄̈̑̎̾̑̓͂̒̈́͗͊̎̎̏̌̈́̍͒̋̒͒̈́͘͜͜͠ȩ̵̡̡̛̛͚̘̙͇̞͎̖̟̯̟̼̤̜̣̻̱̮̱͇͕̗͓̮̌͋̈́̽̃̎͐͂̈́͠͠͠͠ͅͅd̴̟͚͕̬͙̞̫͎̱͍̞̻͖̦̦̳͇̟͖͙̠̙̟̩̬̿̏̋̾̓̉̅̍͋ ̴̡̧̛̳̮͈̃̃̃͆͑̅̿̅̿̽̾̓̅͑̈́̈́̏͗͌͆̏͊̈͗̊͗̽̄̌̄̇̕͠͝p̴̨̢̛̛͎͙͔͚͎͍̪̼̞͕̪̈͑͂͋͋̓̒̂̓̿̆͛̄̏́͌̌̀̃́̀̍̂̈͝ͅa̶̧̢̛̳̳̬͇̗̻͉̲̠̭͙͙̦͍̮̲̱̝̭̺̤͚̲͕̫͉̔̈̒̿̎̈́̍̇̾̈́́̽͂̋͛̇̈́̆̿͊͗̄͗̌͜͠ǧ̶̢̢̨͉̗̜̖̗̘͈̠̥͎̖̹̥̪͕̙͚̹̼̣̳̖͊̔̈̾̓̈͑̇̌̂̇͝ȩ̸̢̢̟̼̣̦͓͙̰̰̺̪̜̪̥̩̬̜̬̭̼̞̥̽̅̓̓̄̑̑̉̌̃̌́̅͘̚̕͠ͅͅͅ ̷̢̡̨̢̧̧̧̛̳̫̝͔̗̥̤̖͉̮̘̦͙̣̪͍̮͍̦̥̘̦͖͔̟̮̗͆̏̎̍͂̃̔̈́̊̓͐͋̽̄͒̈́̐̔̀͛̎̋͘̚͠͝͝i̸̧̢̨̢̡̧̺͇̼̗̬̦̯͇͎̞̥̹͎̜͉̰̬̫͙̥̱̠̗͓̼͇͌̑̽̆̀̂͗́̌̆̉͂͌̇̊̄̒͊͊̓̀̅̒̾̈̔͜͝͝͠ͅͅs̶̡̘̘͉͍͔̬̞͓͉̱̺͋̈́̽̓̇͋͛̍̾̎̒͂͝ͅ ̵̡̠͓̞̞̮̻̮̘͙̰̺̼̤̜̜̥̯̣͉̲͍̼͖̙͚̘̫͔͎̥̠̦̦̘̈́̈͑̍̾̿̾̿̋̈́̌̒̿͗͊̑͆̿̆̆̀̈̉̆̓̿͆̌̑͌̓͌͘͝͝ņ̴̨̛̛̼̰͕̯̟̫̞̲̳̲̬̊̎͋̇͑͛̑̀͒̾̈́̍̽̎́̍̈̈́̓́͒̕̕͝͝o̴̭̦̱̜͖̟͍̦̙̺̰̬̙̼̮̬͕͓͗͗̂̋̐̂͒̒̈͘͜͠t̶̛̛͚̫̖̫͖͔̖͙͋̑̐̅̀̔͂̉̽̈͐͗͊̉͌̄̚ ̵̨̢̧̡̢̛͖̠̤̖̣̤̥͎̜̤̭̰̳͍̈́̆̋̂̒͜͝ͅa̸̧̨̨̨̰͉͉̞̩̞͉̹̖̘̫̲̲̭͈̙̖̩̍́͗͝v̷̧͉̞̟̠̺͙̹̪̥͖̞͖̙̮̱̝̝̩̳̪̣̭͖̂͋͋̓̿͛̚͜a̶͍̞͉̟̳̾̿̔͐́́̂̇̋͌̈́͊̌̐̅̐͑i̴̠̩̯̮͙̳̗̜̜̥̘̼͇̭͊̈́̋͜l̴̹̻̫̟͆̀̍̏̆̌̚͝͝ä̵̢̡̨̧̡̡̛͙̖̮̤̙̱̯̥͓͚̪̞͈͚̪͚̩̋̋̈̈̉̐̿̈́̌̎͗͂̃̋͂̈́͂̾͂͛͒͛̚̚͘͜͝͝͠͝b̵̲̮̳̺͓̻̦͍̲͙̝̀̓̎̑͋̏̄̾̍͛̊̈̾̊̑̿͊̏̚̕ͅl̸̨̜̞̪̜̺͍͉̬̜̹̬̤̱͍̘͕͈͓͖̼͙̤̣̰̪̔̏̀͒͒̉͘͠ͅͅe̸̳̦͂̀͒̅͐',


    '',

    '[◉](https://omega.maanex.tk/)'

  ];

  private userQueries = {};
  private userQueryReset = {};

  private helphelp(user: User): string {
    if (!this.userQueries[user.id])
      this.userQueries[user.id] = 0
    if (this.userQueryReset[user.id])
      clearTimeout(this.userQueryReset[user.id])
    this.userQueryReset[user.id] = setTimeout(() => {
      delete this.userQueries[user.id]
    }, 10 * 60_000)
    let txt = this.helphelpTexts[this.userQueries[user.id]]
    this.userQueries[user.id]++
    if (txt === undefined) {
      let dashes = '⚊⚊'
      while (Math.random() < this.userQueries[user.id] / 20 && dashes.length < 200)
        dashes += '⚊'
      txt = `**[${dashes}]**`
    }
    if (this.userQueries[user.id] > 40)
      txt = 'Ω'
    return txt
  }

}
