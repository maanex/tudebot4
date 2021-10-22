import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'


export function mathModule1dResult(input: MathModuleInput): Promise<MathModuleOutput> {
  if (input.term.dimension !== 0) return null

  return Promise.resolve({
    content: {
      title: 'Result',
      description: `\`\`\`${input.term.compute()}\`\`\``
    }
  })
}
