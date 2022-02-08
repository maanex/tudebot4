import { CommandArgumentChoice, ReplyableCommandAutocompleteInteraction } from 'cordo'


/**
 * Just a test
 */
export default function (i: ReplyableCommandAutocompleteInteraction) {
  const choices: CommandArgumentChoice[] = []

  if (i.data.input.length) {
    choices.push({
      name: `Google for "${i.data.input}"`,
      value: `google:${i.data.input}`
    })
  }

  if ('daily'.startsWith(i.data.input?.toLowerCase() ?? 'no')) {
    choices.push({
      name: 'Claim daily reward',
      value: 'daily'
    })
  }

  choices.push({
    name: 'never mind...',
    value: '-'
  })

  i.show(choices)
}
