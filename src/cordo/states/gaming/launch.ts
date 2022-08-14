import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponent } from 'cordo'
import { Languages } from '../../../lib/data/languages'
import { Game, GameInstance, Gaming } from '../../../lib/gaming/gaming'


export default function (_i: GenericInteraction, [ instance, settingsPage ]: [ GameInstance<any>, number ]): InteractionApplicationCommandCallbackData {
  if (!instance) return { content: 'error' }

  const game = Gaming.allGames.find(g => g.info.id === instance.game)
  if (!game) return { content: 'error' }

  switch (settingsPage || 0) {
    case 0: return generalSettings(game, instance)
    case 1: return specificSettings(game, instance)
    case 2: return lobby(game, instance)
    default: return { content: 'error' }
  }
}

function generalSettings(game: Game<any>, instance: GameInstance<any>): InteractionApplicationCommandCallbackData {
  return {
    title: `Play ${game.info.name}`,
    description: 'Before we start:',
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: `gaming_launch_conf_${instance.uid}_language_0`,
        options: game.info.languages.map(key => ({
          value: key,
          label: Languages.codeLookupNative[key],
          default: instance.config.language === key
        }))
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'Continue',
        custom_id: game.options.length
          ? `gaming_launch_prep_${instance.uid}_1`
          : `gaming_launch_prep_${instance.uid}_2`
      }
    ]
  }
}

function specificSettings(game: Game<any>, instance: GameInstance<any>): InteractionApplicationCommandCallbackData {
  return {
    title: `Play ${game.info.name}`,
    description: 'Game settings:',
    components: [
      ...game.options.map(o => ({
        type: ComponentType.SELECT,
        custom_id: `gaming_launch_conf_${instance.uid}_${o.id}_1`,
        options: o.options
      }) as MessageComponent),
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'Start Game',
        custom_id: `gaming_launch_prep_${instance.uid}_2`
      }
    ]
  }
}

function lobby(game: Game<any>, instance: GameInstance<any>): InteractionApplicationCommandCallbackData {
  const playerCount = instance.players.length
  const waitingFor = (playerCount < game.info.minPlayers)
    ? `Waiting for ${game.info.minPlayers - playerCount} more player${game.info.minPlayers - playerCount === 1 ? '' : 's'}`
    : (playerCount > game.info.maxPlayers)
        ? `Too many players in this lobby! This game is for max ${game.info.maxPlayers} players. You are ${playerCount}!`
        : `Waiting for ${instance.host.nickname || instance.host.user.username} to start the game!`

  const playerList = instance.players
    .map(p => `• ${p.nickname || p.user.username}`)
    .join('\n')

  return {
    title: `${game.info.name} Lobby`,
    description: `Click the button below to join!\n${waitingFor}\n\n${playerList}`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.PRIMARY,
        label: 'Join Game',
        custom_id: `gaming_launch_join_${instance.uid}`,
        flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        label: 'Start',
        custom_id: `gaming_launch_prep_${instance.uid}_start`,
        disabled: (playerCount < game.info.minPlayers) || (playerCount > game.info.maxPlayers)
      }
    ]
  }
}
