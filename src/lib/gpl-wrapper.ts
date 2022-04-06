import axios from 'axios'
import { config } from '..'
import uploadImageToCdn from './images/img-cdn'


export async function runGpl(script: string, variables?: Record<string, string>): Promise<string> {
  try {
    const { data, headers } = await axios.post(
      config.thirdparty.gibuapis.pipelineEndpoint,
      script,
      {
        validateStatus: null,
        responseType: 'arraybuffer',
        headers: {
          accept: '*/*',
          'content-type': 'text/plain'
        },
        params: variables
      }
    )

    const type = headers?.['content-type']
    if (type?.startsWith('image')) {
      const url = await uploadImageToCdn(data as Buffer, 'gpl-output.' + type.substring(6).split(';')[0])
      return url
    }

    const out = JSON.parse((data as Buffer).toString())
    const jsonString = JSON.stringify(out, null, 2)
    const outString = `\`\`\`json\n${jsonString.length > 1980 ? jsonString.substring(0, 1980) + '...' : jsonString}\`\`\``

    if (!out.success)
      return outString

    if (out.type === 'string')
      return out.data + ''
    if (out.type === 'number')
      return out.data + ''
    if (out.type === 'boolean')
      return out.data + ''

    return outString
  } catch (ex) {
    return `\`${ex}\``
  }
}
