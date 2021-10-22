import { ButtonStyle, ComponentType } from 'cordo'
import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'


export function mathModule2dTable(input: MathModuleInput): Promise<MathModuleOutput> {
  if (!input.state._init || input.event === 'reset') {
    input.state._init = true
    input.state.zoom = 1
    input.state.offset = -1
  }

  if (input.event) {
    if (input.event === 'down')
      input.state.offset += 5
    if (input.event === 'up')
      input.state.offset -= 5
    if (input.event === 'plus') {
      input.state.zoom /= 2
      input.state.offset *= 2
    }
    if (input.event === 'minus') {
      input.state.zoom *= 2
      input.state.offset /= 2
    }
  }


  const inputs = getInputs(input.state.zoom, input.state.offset)
  const result = inputs.map(i => ([
    i,
    (input.term as any).compute(i)
  ]))

  const col1Width = Math.max(...inputs.map(i => i.toString().length))
  const col2Width = Math.max(...result.map(r => r[1].toString().length))

  let table = `${'x'.padEnd(col1Width + 1)}|${' value'.padEnd(col2Width)}\n${'-'.repeat(col1Width + 1)}+${'-'.repeat(col2Width + 1)}`
  for (const [ inp, out ] of result)
    table += `\n${inp.toString().padStart(col1Width)} | ${out.toString()}`

  return Promise.resolve({
    content: {
      title: 'Values',
      description: `\`\`\`${table}\`\`\``
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
        label: 'Up',
        custom_id: 'up'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Down',
        custom_id: 'down'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Reset',
        custom_id: 'reset'
      }
    ]
  })
}

function getInputs(zoom: number, offset: number): number[] {
  offset *= zoom
  const out = []
  for (let i = 0; i < 10; i++)
    out.push(offset += zoom)
  return out
}
