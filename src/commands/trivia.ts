import { User, TextChannel } from 'discord.js'
import axios from 'axios'
import Cordo, { ComponentType, ButtonStyle } from 'cordo'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'

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

  public async execute(_channel: TextChannel, _user: User, _args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    const url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986'

    try {
      const { data } = await axios.get(url)
      const res = data.results[0]

      const options = [ res.correct_answer, ...res.incorrect_answers ]
        .map((ans, i) => ({ text: decodeURIComponent(ans), id: i + 1 }))
        .sort(() => Math.random() - 0.5)
        .sort(() => Math.random() - 0.5) // doppelt hält besser

      Cordo.sendRichReply(event.message, {
        title: 'Trivia time!',
        description: decodeURIComponent(res.question),
        footer: `${decodeURIComponent(res.category)} • ${res.difficulty}`,
        components: options.map(o => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: o.text,
          custom_id: `trivia_answer_${o.id}`
        }))
      }, true)

      return true
    } catch (err) {
      console.error(err)
      repl('An error occured!', 'bad')
      return false
    }
  }

}
