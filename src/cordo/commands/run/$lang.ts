import axios from 'axios'
import { ReplyableCommandInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import { TudeBot } from '../../..'
import { runGpl } from '../../../thirdparty/gibuapis/gpl-wrapper'


type ScriptReturn = {
  output: string
}

export default async function (i: ReplyableCommandInteraction) {
  const lang = i.params.lang
  const script = i.data.option.src + ''
  const mesProm = i.reply({ content: 'Executing...' })

  const context = { user: i.user }
  const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel

  const [ result, mes ] = await Promise.all([
    execute(lang, script, channel, i.user.id, context),
    mesProm
  ])

  const content = result.output
  mes.edit({ content })
}


async function execute(language: string, script: string, channel: TextChannel, executor: string, context?: any): Promise<ScriptReturn> {
  if (script.startsWith('http')) {
    const { data, status } = await axios.get(script, { validateStatus: null })
    if (status === 200)
      script = data + ''
  }

  switch (language) {
    case 'gpl': return executeGPL(script, channel, executor)
    default: return executeOnPiston(language, script, context)
  }
}

async function executeOnPiston(language: string, script: string, context?: any): Promise<ScriptReturn> {
  const payload = buildPistonRequest(language, script, context)
  const { data } = await axios.post('https://emkc.org/api/v2/piston/execute', payload, { validateStatus: null })

  return { output: `\`\`\`${data.run?.output}\`\`\`` }
}

function buildPistonRequest(language: string, script: string, context?: any): any {
  if (language === 'js') {
    if (!script.includes(';') && !script.includes('return'))
      script = `return (${script})`
    const fullscript = `console.log(((_context)=>{${script}})(${JSON.stringify(context)})||'')`
    return {
      language: 'js',
      version: '16.3.0',
      files: [
        { content: fullscript }
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

async function executeGPL(script: string, channel: TextChannel, executor: string): Promise<ScriptReturn> {
  if (script.startsWith('$')) return dangerousEvalLocalJavascript(script.substring(1), channel, executor)

  let output = await runGpl(script)
  if (output.length > 1995)
    output = output.substring(0, 1995) + '...'
  return { output }
}

/* eslint-disable no-unused-vars */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unused-vars */
async function dangerousEvalLocalJavascript(script: string, channel: TextChannel, executor: string): Promise<ScriptReturn> {
  if (executor !== '137258778092503042') return { output: 'no' }

  try {
    const guild = channel.guild
    const bot = TudeBot
    const self = TudeBot.user
    const core = TudeBot.user

    const built = `(async () => { ${script} })()`
    const res = await eval(built)
    return { output: `\`\`\`${res ?? 'empty'}\`\`\`` }
  } catch (ex) {
    return { output: ex + '' }
  }
}
