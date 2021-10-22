import * as Math from 'mathjs'


type DimAndCompute = {
  dimension: 0
  compute: () => number
} | {
  dimension: 1
  compute: (x: number) => number
} | {
  dimension: 2
  compute: (x: number, y: number) => number
}

type ParseSuccess = {
  success: true
  message: ''
  mathjs: {
    input: string
    func: Math.EvalFunction,
    vars: string[]
  }
} & DimAndCompute

type ParseError = {
  success: false
  message: string
  dimension: 0
  compute: undefined
  mathjs: undefined
}

export type ParsedTerm = {
  input: string
} & (ParseSuccess | ParseError)


export function parseTerm(input: string): ParsedTerm {
  try {
    const term = formatTerm(input)
    const compiled = Math.compile(term)

    try {
      const val = compiled.evaluate()

      return {
        input,
        success: true,
        message: '',
        dimension: 0,
        compute: () => val,
        mathjs: {
          input: term,
          func: compiled,
          vars: []
        }
      }
    } catch (ex) {
      if (ex.message.startsWith('Undefined symbol')) {
        const varName1 = ex.message.replace('Undefined symbol ', '')[0]

        try {
          compiled.evaluate({ [varName1]: 1 })
          return {
            input,
            success: true,
            message: '',
            dimension: 1,
            compute: (x: number) => compiled.evaluate({ [varName1]: x }),
            mathjs: {
              input: term,
              func: compiled,
              vars: [ varName1 ]
            }
          }
        } catch (ex) {
          if (ex.message.startsWith('Undefined symbol')) {
            const varName2 = ex.message.replace('Undefined symbol ', '')[0]

            try {
              compiled.evaluate({ [varName1]: 1, [varName2]: 1 })
              return {
                input,
                success: true,
                message: '',
                dimension: 2,
                compute: (x: number, y: number) => compiled.evaluate({ [varName1]: x, [varName2]: y }),
                mathjs: {
                  input: term,
                  func: compiled,
                  vars: [ varName1, varName2 ]
                }
              }
            } catch (ex) {
              return {
                input,
                success: false,
                message: 'Too many variables',
                dimension: 0,
                compute: undefined,
                mathjs: undefined
              }
            }
          } else {
            return {
              input,
              success: false,
              message: ex + '',
              dimension: 0,
              compute: undefined,
              mathjs: undefined
            }
          }
        }
      } else {
        return {
          input,
          success: false,
          message: ex + '',
          dimension: 0,
          compute: undefined,
          mathjs: undefined
        }
      }
    }
  } catch (ex) {
    return {
      input,
      success: false,
      message: ex + '',
      dimension: 0,
      compute: undefined,
      mathjs: undefined
    }
  }
}

export function formatTerm(term: string) {
  return term
    .replaceAll('²', '^2')
    .replaceAll('³', '^3')
    .replaceAll(',', '.')
}
