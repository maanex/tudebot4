import axios from 'axios'
import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, InteractionComponentFlag, ReplyableCommandInteraction } from 'cordo'


export default async function (i: ReplyableCommandInteraction) {
  const { data: o } = await axios.get(`https://api.urbandictionary.com/v0/define?term=${i.data.option.term}`)
  const definitions = o.list.sort((a, b) => (b.thumbs_up - b.thumbs_down) - (a.thumbs_up - a.thumbs_down))
  const term = i.data.option.term[0].toUpperCase() + (i.data.option.term as string).substring(1).toLowerCase()

  if (Math.random() < 99) {
    const t = i.data.option.term
    if (t === 'addGaming')
      await i.userData.achievement('TEST_COLLECT').addCollectable('gaming')
    else if (t === 'addCool')
      i.userData.achievement('TEST_COLLECT').addCollectable('cool')
    else if (t === 'addNice')
      i.userData.achievement('TEST_COLLECT').addCollectable('nice')
    else if (t === 'set')
      i.userData.achievement('TEST_COLLECT').setCollectables([ 'gaming', 'cool' ])
    else if (t === 'clear')
      i.userData.achievement('TEST_COLLECT').setCollectables([ ])
    else if (t === 'get')
      i.userData.achievement('TEST_COLLECT').getCollectables().then(console.log)
    else if (t === 'has')
      i.userData.achievement('TEST_COLLECT').has().then(console.log)
  }

  const buildResponse: (index: number) => InteractionApplicationCommandCallbackData = (index: number) => ({
    content: `[${term}](<${definitions[index].permalink}>) — ${definitions[index].definition.replace(/\[(.+?)\]/g, '[$1](<https://www.urbandictionary.com/define.php?term=$1##>)').split('.php?term=').map(e => e.includes('##>') ? `${e.split('##>')[0].split(' ').join('%20')}>${e.split('##>')[1]}` : e).join('.php?term=')}`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '<',
        custom_id: `show_${index - 1}`,
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ],
        disabled: index <= 0
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Next definition',
        custom_id: `show_${index + 1}`,
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ],
        disabled: definitions.length <= index + 1
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
