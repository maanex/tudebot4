import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, MessageComponent, MessageEmbed, ReplyableCommandInteraction } from 'cordo'
import Emojis from '../../int/emojis'
import uploadImageToCdn from '../../lib/images/img-cdn'
import { renderMathTerm } from '../../lib/math/rendering/terms/render-term'
import { ParsedTerm, parseTerm } from '../../lib/math/logic/parse-term'
import { mathModule2dPlot } from '../../lib/math/modules/2d-plot'
import { mathModule1dResult } from '../../lib/math/modules/1d-result'
import { mathModule2dTable } from '../../lib/math/modules/2d-table'
import { mathModule2dAlgebra } from '../../lib/math/modules/2d-algebra'
import { mathModule3dFlatPlot } from '../../lib/math/modules/3d-flat-plot'
import { mathModule3dIsoPlot } from '../../lib/math/modules/3d-iso-plot'


export type MathModuleInput = {
  term: ParsedTerm
  state: any
  event: string
}

export type MathModuleOutput = {
  content: MessageEmbed
  buttons?: MessageComponent[]
}

const modules: Record<
  0 | 1 | 2, {
    name: string,
    func: (input: MathModuleInput) => MathModuleOutput | Promise<MathModuleOutput>
  }[]
> = {
  0: [
    { name: 'Result', func: mathModule1dResult }
  ],
  1: [
    { name: '2D Plot', func: mathModule2dPlot },
    { name: 'Values', func: mathModule2dTable },
    { name: 'Algebra', func: mathModule2dAlgebra }
  ],
  2: [
    { name: 'Flat Plot', func: mathModule3dFlatPlot },
    { name: 'Isometric Plot', func: mathModule3dIsoPlot }
  ]
}

export default async function (i: ReplyableCommandInteraction) {
  i.defer()

  const input = i.data.option.term as string
  const term = parseTerm(input)

  if (!term.success) {
    return i.reply({
      title: Emojis.modlog.warning.string + ' Error',
      description: term.message
    })
  }

  const inBuff = await renderMathTerm(term.input)
  const inUrl = await uploadImageToCdn(inBuff)

  const mods = modules[term.dimension]
  let currentMod = 0
  const states = []
  for (let i = 0; i < mods.length; i++)
    states.push({})

  const content = await reRender(
    mods[currentMod], {
      event: '',
      state: states[currentMod],
      term
    }, inUrl
  )
  i
    .replyInteractive(content)
    .withTimeout(
      5 * 60 * 1000,
      j => j.disableComponents(),
      { onInteraction: 'restartTimeout' }
    )
    .on('usemod_$mod', async (h) => {
      currentMod = parseInt(h.params.mod)
      const content = await reRender(
        mods[currentMod], {
          event: '',
          state: states[currentMod],
          term
        }, inUrl
      )
      h.edit(content)
    })
    .on('$event', async (h) => {
      const content = await reRender(
        mods[currentMod], {
          event: h.params.event,
          state: states[currentMod],
          term
        }, inUrl
      )
      h.edit(content)
    })
}

async function reRender(module: typeof modules['0'][number], input: MathModuleInput, inUrl: string): Promise<InteractionApplicationCommandCallbackData> {
  const result = await module.func(input)
  result.content.color = 0x2F3136
  result.content.title = result.content.title ? `${Emojis.modlog.userQuit.string} ${result.content.title}` : undefined
  return {
    embeds: [
      {
        description: `${Emojis.modlog.userJoin} **Input:**`,
        color: 0x2F3136,
        image: { url: inUrl }
      },
      result.content
    ],
    components: [
      ...(result.buttons ?? []),
      {
        type: ComponentType.LINE_BREAK,
        visible: !!result.buttons?.length
      },
      ...modules[input.term.dimension].map((mod, index) => ({
        type: ComponentType.BUTTON,
        style: mod.name === module.name ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        disabled: mod.name === module.name,
        label: mod.name,
        custom_id: `usemod_${index}`
      }) as MessageComponent)
    ]
  }
}
