import axios from 'axios'
import { ButtonStyle, ComponentType, ReplyableCommandInteraction } from 'cordo'


export default async function (i: ReplyableCommandInteraction) {
  const url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986'

  try {
    const { data } = await axios.get(url)
    const res = data.results[0]
    const ids = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => Math.random() - 0.5)

    const options = [ res.correct_answer, ...res.incorrect_answers ]
      .map((ans, index) => ({ text: decodeURIComponent(ans), id: ids[index] }))
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5) // doppelt hält besser

    i
      .replyInteractive({
        title: 'Trivia time!',
        description: decodeURIComponent(res.question),
        footer: `${decodeURIComponent(res.category)} • ${res.difficulty}`,
        components: options.map(o => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          label: o.text,
          custom_id: o.id
        }))
      })
      .withTimeout(
        20e3,
        j => j.disableComponents(),
        { onInteraction: 'removeTimeout' }
      )
      .on('$option', (h) => {
        h.edit({
          components: options.map(o => ({
            type: ComponentType.BUTTON,
            style: o.id === ids[0]
              ? ButtonStyle.SUCCESS
              : o.id === h.params.option
                ? ButtonStyle.DANGER
                : ButtonStyle.SECONDARY,
            label: o.text,
            custom_id: o.id,
            disabled: true
          }))
        })
      })
  } catch (err) {
    console.error(err)
    i.replyPrivately({ title: 'oops, error' })
    return false
  }
}

