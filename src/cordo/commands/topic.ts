import { ReplyableCommandInteraction } from 'cordo'
import DailyTopicModule from '../../modules/dailytopic'
import { TudeBot } from '../..'
import { timeoutOnPromise } from '../../lib/time-utils'


export default async function (i: ReplyableCommandInteraction) {
  const module = TudeBot.getModule<DailyTopicModule>('dailytopic')
  const topic = module.generateTopic(i.guild_id)
  const content = await timeoutOnPromise(topic, 2000, () => i.defer())
  i.reply({ content })
}
