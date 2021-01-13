import { User, TextChannel } from 'discord.js'
import axios from 'axios'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'
import Emojis from '../int/emojis'

export default class TriviaCommand extends Command {

  constructor() {
    super({
      name: 'trivia',
      aliases: [ 'quiz', 'quizz', 'question' ],
      description: 'Trivia time!',
      cooldown: 10,
      groups: [ 'fun', 'apiwrapper' ]
    })
  }

  public async execute(channel: TextChannel, user: User, _args: string[], _event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    // const cmdl = ParseArgs.parse(args)
    const url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986'

    try {
      const { data } = await axios.get(url)

      const res = data.results[0]
      let options = []

      options.push(res.correct_answer)
      options.push(...res.incorrect_answers)

      options = options.sort(() => Math.random() - 0.5).map(decodeURIComponent)
      const correct = options.indexOf(decodeURIComponent(res.correct_answer))

      channel.send({
        embed: {
          color: 0x2F3136,
          title: 'Trivia time!',
          fields: [
            {
              name: `${decodeURIComponent(res.category)} • ${res.difficulty}`,
              value: `${Emojis.BIG_SPACE}\n**${decodeURIComponent(res.question)}**\n🇦 ${options[0]}\n🇧 ${options[1]}\n🇨 ${options[2]}\n🇩 ${options[3]}\n\nCorrect answer: ||${([ '🇦', '🇧', '🇨', '🇩' ])[correct]}||`
            }
          ],
          footer: {
            text: '@' + user.username + ' • powered by opentdb.com'
          }
        }
      })

      return true
    } catch (err) {
      console.error(err)
      repl('An error occured!', 'bad')
      return false
    }
  }

}
