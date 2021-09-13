import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, InteractionComponentFlag, ReplyableCommandInteraction } from 'cordo'


export default async function (i: ReplyableCommandInteraction) {
  const { data: o } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${i.data.option.term}`)
  const definitions = o.list.sort((a, b) => (b.thumbs_up - b.thumbs_down) - (a.thumbs_up - a.thumbs_down))
  const term = i.data.option.term[0].toUpperCase() + (i.data.option.term as string).substring(1).toLowerCase()

  const buildResponse: (i: number) => InteractionApplicationCommandCallbackData = (i: number) => ({
    content: `[${term}](<${definitions[i].permalink}>) — ${definitions[i].definition.replace(/\[(.+?)\]/g, '[$1](<https://www.urbandictionary.com/define.php?term=$1##>)').split('.php?term=').map(e => e.includes('##>') ? `${e.split('##>')[0].split(' ').join('%20')}>${e.split('##>')[1]}` : e).join('.php?term=')}`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Show a different definition',
        custom_id: `show_${i + 1}`,
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ],
        disabled: definitions.length <= i + 1
      }
    ]
  })

  if (definitions?.length) {
    i
      .replyInteractive(buildResponse(0))
      .withTimeout(
        5 * 60 * 1000,
        j => j.removeComponents(),
        { onInteraction: 'doNothing' }
      )
      .on('show_$item', h => h.edit(buildResponse(parseInt(h.params.item))))
  } else {
    i.reply({
      content: `[${term}](<https://www.urbandictionary.com/define.php?term=${term}>) — *A word so rare, no definition was found.*`
    })
  }
}
