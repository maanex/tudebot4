import { ButtonStyle, ComponentType } from 'cordo'
import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'
import uploadImageToCdn from '../../images/img-cdn'
import { compute2dFunction } from '../logic/compute-function'
import { renderSimple2dGraph } from '../rendering/plotter/2d-graph'

export async function mathModule2dPlot(input: MathModuleInput): Promise<MathModuleOutput> {
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

  if (input.term.dimension !== 1) return null

  const { points, lower, higher } = compute2dFunction(input.term.compute, input.state.xAlign, input.state.zoom)

  const delta = Math.abs(higher - lower)
  const fromY = input.state.yAlign < 0
    ? -delta
    : input.state.yAlign > 0
      ? 0
      : -delta / 2
  const toY = input.state.yAlign < 0
    ? 0
    : input.state.yAlign > 0
      ? delta
      : delta / 2

  const outBuff = await renderSimple2dGraph(300, 200, 0xFFFFFF, lower, higher, fromY, toY, points)
  const outUrl = await uploadImageToCdn(outBuff)

  return {
    content: {
      title: '2d Plot',
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
