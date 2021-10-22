import * as Math from 'mathjs'
import { ButtonStyle, ComponentType } from 'cordo'
import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'
import { renderMathTerm } from '../rendering/terms/render-term'
import uploadImageToCdn from '../../img-cdn'


const modeNames = {
  simplify: 'Simplified',
  '1derivative': 'First Derivative',
  '2derivative': 'Second Derivative',
  rationalize: 'Rationalized'
}

export async function mathModule2dAlgebra(input: MathModuleInput): Promise<MathModuleOutput> {
  if (input.event === 'simplify')
    input.state.mode = 'simplify'
  if (input.event === '1derivative')
    input.state.mode = '1derivative'
  if (input.event === '2derivative')
    input.state.mode = '2derivative'
  if (input.event === 'rationalize')
    input.state.mode = 'rationalize'

  if (!input.state.cache)
    input.state.cache = {}

  const mode = input.state.mode || 'simplify'

  let url = ''
  let term = ''
  if (input.state.cache[mode]) {
    [ url, term ] = input.state.cache[mode]
  } else {
    if (mode === 'simplify') {
      term = Math.simplify(input.term.mathjs.input).toString()
    } else if (mode === '1derivative') {
      term = Math.derivative(input.term.mathjs.input, input.term.mathjs.vars[0]).toString()
      input.state.derivative = term
    } else if (mode === '2derivative') {
      const first = input.state.derivative || Math.derivative(input.term.mathjs.input, input.term.mathjs.vars[0]).toString()
      term = Math.derivative(first, input.term.mathjs.vars[0]).toString()
      input.state.derivative = term
    } else if (mode === 'rationalize') {
      term = Math.rationalize(input.term.mathjs.input).toString()
    }

    const buff = await renderMathTerm(term)
    url = await uploadImageToCdn(buff)
    input.state.cache[mode] = [ url, term ]
  }

  const rationalizationPossible = !/[a-zA-Z]/g.test(term.replaceAll(input.term.mathjs.vars[0], ''))

  return {
    content: {
      title: modeNames[mode],
      description: `\`\`\`${term.replaceAll(' ', '')}\`\`\``,
      image: { url }
    },
    buttons: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Simplify',
        custom_id: 'simplify',
        disabled: mode === 'simplify'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'First Derivative',
        custom_id: '1derivative',
        disabled: mode === '1derivative'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Second Derivative',
        custom_id: '2derivative',
        disabled: mode === '2derivative'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Rationalize',
        custom_id: 'rationalize',
        disabled: mode === 'rationalize',
        visible: rationalizationPossible
      }
    ]
  }
}
