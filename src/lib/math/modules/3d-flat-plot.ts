import { ButtonStyle, ComponentType } from 'cordo'
import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'
import uploadImageToCdn from '../../img-cdn'
import { renderSimple3dFlatGraph } from '../rendering/plotter/3d-flat-graph'


export async function mathModule3dFlatPlot(input: MathModuleInput): Promise<MathModuleOutput> {
  if (!input.state._init || input.event === 'reset') {
    input.state._init = true
    input.state.xAlign = 0
    input.state.yAlign = 0
    input.state.zoom = 1
  }

  if (input.event) {
    if (input.event === 'xalign') {
      input.state.xAlign--
      if (input.state.xAlign < -1)
        input.state.xAlign = 1
    }
    if (input.event === 'yalign') {
      input.state.yAlign--
      if (input.state.yAlign < -1)
        input.state.yAlign = 1
    }
    if (input.event === 'plus')
      input.state.zoom /= 2
    if (input.event === 'minus')
      input.state.zoom *= 2
  }

  if (input.term.dimension !== 2) return null

  const lower = -10 * input.state.zoom
  const higher = 10 * input.state.zoom

  const outBuff = await renderSimple3dFlatGraph(
    300, 300,
    0xFFFFFF,
    lower - 10 * input.state.zoom * input.state.xAlign,
    higher - 10 * input.state.zoom * input.state.xAlign,
    lower + 10 * input.state.zoom * input.state.yAlign,
    higher + 10 * input.state.zoom * input.state.yAlign,
    input.term.compute
  )
  const outUrl = await uploadImageToCdn(outBuff)

  return {
    content: {
      title: 'Flat Plot',
      image: { url: outUrl }
    },
    buttons: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: '+',
        custom_id: 'plus',
        disabled: input.state.zoom <= 0.0009765625
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: '-',
        custom_id: 'minus',
        disabled: input.state.zoom >= 262144
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'X Alignment',
        custom_id: 'xalign'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Y Alignment',
        custom_id: 'yalign'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Reset',
        custom_id: 'reset'
      }
    ]
  }
}
