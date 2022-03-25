import axios from 'axios'
import { ReplyableCommandInteraction } from 'cordo'
import { config } from '../../..'
import uploadImageToCdn from '../../../lib/images/img-cdn'


type ScriptReturn = {
  output: string
}

export default async function (i: ReplyableCommandInteraction) {
  const lang = i.params.lang
  const script = i.data.option.src + ''
  const mesProm = i.reply({ content: 'Executing...' })

  const [ result, mes ] = await Promise.all([
    execute(lang, script),
    mesProm
  ])

  const content = result.output
  mes.edit({ content })
}


async function execute(language: string, script: string): Promise<ScriptReturn> {
  if (script.startsWith('http')) {
    const { data, status } = await axios.get(script, { validateStatus: null })
    if (status === 200)
      script = data + ''
  }

  switch (language) {
    case 'gpl': return executeGPL(script)
    default: return executeOnPiston(language, script)
  }
}

async function executeOnPiston(language: string, script: string): Promise<ScriptReturn> {
  const payload = buildPistonRequest(language, script)
  const { data } = await axios.post('https://emkc.org/api/v2/piston/execute', payload, { validateStatus: null })

  return { output: `\`\`\`${data.run?.output}\`\`\`` }
}

function buildPistonRequest(language: string, script: string): any {
  if (language === 'js') {
    return {
      language: 'js',
      version: '16.3.0',
      files: [
        { content: script }
      ]
    }
  }

  if (language === 'java') {
    if (!script.startsWith('class'))
      script = `class Main { public static void main(String[] args) { ${script} } }`
    return {
      language: 'java',
      version: '15.0.2',
      files: [
        { content: script }
      ]
    }
  }

  if (language === 'python') {
    return {
      language: 'python',
      version: '3.10.0',
      files: [
        { content: script }
      ]
    }
  }
}

async function executeGPL(script: string): Promise<ScriptReturn> {
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
        }
      }
    )

    const type = headers?.['content-type']
    if (type?.startsWith('image')) {
      const url = await uploadImageToCdn(data as Buffer, 'gpl-output.' + type.substring(6).split(';')[0])
      return { output: url }
    }

    const out = JSON.parse((data as Buffer).toString())
    return Promise.resolve({ output: `\`\`\`json\n${JSON.stringify(out, null, 2)}\`\`\`` })
  } catch (ex) {
    return { output: ex }
  }
}
