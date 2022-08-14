import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../../..'
import { GameInstance, Gaming } from '../../../../lib/gaming/gaming'


export default async function (i: ReplyableComponentInteraction) {
  const instance = Gaming.runningGames.get(i.params.uid)
  if (!instance)
    return i.replyPrivately({ content: 'Something failed. Please try again.' })

  if (i.params.step === 'start')
    return startGame(instance, i)

  const step = Number(i.params.step)

  if (step === 1) {
    const err = await findPlayers(instance, i)
    if (err) return i.replyPrivately({ content: err })
  }

  i.state('gaming_launch', instance, step)
}

function startGame(instance: GameInstance<any>, i: ReplyableComponentInteraction) {
  const game = Gaming.getGameById(instance.game)
  if (!game) return i.replyPrivately({ content: 'Something failed lmao' })

  game.startGame(instance, i)
}

async function findPlayers(instance: GameInstance<any>, i: ReplyableComponentInteraction): Promise<string | null> {
  if (!i.guild_id) return 'Error, not in guild'
  const guild = await TudeBot.guilds.fetch(i.guild_id)
  if (!guild) return 'Error fetching guild'
  const member = await guild.members.fetch(i.user.id)
  if (!member) return 'Error fetching member'

  if (!member.voice?.channel) return 'You are not in a voice channel. Please join one or switch to a different playerbase.'
  const members = member.voice.channel.members
  const filtered = [ ...members.values() ]
    .filter(m => (!m.user.bot && !m.voice?.deaf))

  const game = Gaming.getGameById(instance.game)
  if (!game) return 'Error fetching game'

  if (filtered.length < game.info.minPlayers) return `This game requires ${game.info.minPlayers} players. There's only ${filtered.length} in your voice channel. That's too few!`
  if (filtered.length > game.info.maxPlayers) return `This game can only be played with ${game.info.maxPlayers} players or less. There's ${filtered.length} in your voice channel. That's too many!`

  instance.players = filtered
}
