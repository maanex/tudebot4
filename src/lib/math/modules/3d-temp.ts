import { MathModuleInput, MathModuleOutput } from '../../../cordo/commands/math'


export function mathModule3dTemp(input: MathModuleInput): Promise<MathModuleOutput> {
  if (input.term.dimension !== 0) return null

  return Promise.resolve({
    content: {
      title: 'This is a placeholder',
      description: 'Telling you that 2d functions are not supported yet, but im working on it. xoxo'
    }
  })
}
