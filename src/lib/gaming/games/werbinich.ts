import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionTypeModalSubmit, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import { GuildMember } from 'discord.js'
import { pairPeople } from '../../pair-people'
import { polyfillGetSubmission } from '../../utils/cordo-utils'
import { truncateString } from '../../utils/string-utils'
import { Game, GameInfo, GameInstance, GameOption, Gaming } from '../gaming'


type State = {
  // key: user -> value: user they chose the name for
  assignments: Record<string, string>
  // key: user -> value: name they have to guess
  names: Record<string, string>
  // the person who is currently guessing
  currently: string
  // the people who already completed
  finished: string[]
}

export default class WerbinichGame implements Game<State> {

  public info: GameInfo = {
    id: 'werbinich',
    name: 'Wer bin ich',
    descriptionShort: 'TODO',
    descriptionLong: 'Wer bin ich ist ein super spiel.',
    icon: '🥸',
    minPlayers: 2,
    maxPlayers: 20,
    languages: [ 'de' ],
    estTime: '2-200 min',
    enabled: true
  }

  public options: GameOption[] = []

  createInitialState(): State {
    return {
      assignments: {},
      names: {},
      currently: '',
      finished: []
    }
  }

  startGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    i.edit({
      title: 'Willkommen zu Wer bin ich!',
      description: 'Als erstes müsst ihr euch jeweils eine Person aussuchen, für die ihr den Namen heraussuchen wollt.\nSollten mehrere Leute die selbe Person wählen wird der Zufall entscheiden.',
      components: [
        {
          type: ComponentType.SELECT,
          custom_id: Gaming.getCustomId(instance, this.playerSelectTarget),
          options: [
            {
              label: 'Zufällig',
              value: 'random',
              description: 'Mir doch egal'
            },
            ...instance.players.map(p => ({
              label: p.nickname || p.user.username,
              value: p.id
            }))
          ],
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  playerSelectTarget(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const id = i.data.values[0]
    if (id === i.user.id)
      return i.replyPrivately({ content: 'Bischd blöd oder was? Du kannst dich nich selber nehmen.' })

    instance.state.assignments[i.user.id] = id
    this.updateTargetScreen(instance, i)
  }

  updateTargetScreen(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const notLoggedIn = instance.players.filter(p => !instance.state.assignments[p.id])

    if (notLoggedIn.length === 0) return this.startActualGame(instance, i)

    const text = (notLoggedIn.length > 3)
      ? `Wir warten auf ${notLoggedIn} weitere Leute...`
      : `Wir warten noch auf ${notLoggedIn.join(', ')}`

    i.edit({
      title: 'Willkommen zu Wer bin ich!',
      description: `Als erstes müsst ihr euch jeweils eine Person aussuchen, für die ihr den Namen heraussuchen wollt.\nSollten mehrere Leute die selbe Person wählen wird der Zufall entscheiden.\n\n${text}`
    })
  }

  startActualGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const assignments = { ...instance.state.assignments }
    for (const key in assignments) {
      if (assignments[key] === 'random')
        delete assignments[key]
    }

    const matches = pairPeople(instance.players.map(p => p.id), assignments)
    instance.state.assignments = matches

    i.edit({
      title: 'Alles klar, los gehts!',
      description: 'Jedem von euch wurde nun eine andere Person zugewiesen. Klickt bitte auf den Knopf unten um zu sehen wer es ist und einen Namen einzutragen.',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          label: 'Namen verteilen',
          custom_id: Gaming.getCustomId(instance, this.openSubmitNameDialogue),
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  updateNamingScreen(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const notSubmitted = instance.players.filter(p => !instance.state.names[instance.state.assignments[p.id]])

    if (notSubmitted.length === 0) return this.allNamesSubmitted(instance, i)

    const text = (notSubmitted.length > 3)
      ? `Wir warten auf ${notSubmitted} weitere Leute...`
      : `Wir warten noch auf ${notSubmitted.join(', ')}`

    i.edit({
      title: 'Alles klar, los gehts!',
      description: `Jedem von euch wurde nun eine andere Person zugewiesen. Klickt bitte auf den Knopf unten um zu sehen wer es ist und einen Namen einzutragen.\n\n${text}`
    })
  }

  openSubmitNameDialogue(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    const targetId = instance.state.assignments[i.user.id]
    const target = instance.players.find(p => p.id === targetId)

    i.openModal({
      title: truncateString(`Du hast ${target.nickname || target.user.username}`, 25),
      custom_id: CordoAPI.compileCustomId(Gaming.getCustomId(instance, this.sendSubmitNameDialogue), [ InteractionComponentFlag.ACCESS_EVERYONE ]),
      components: [
        {
          type: ComponentType.TEXT,
          style: TextInputStyle.SHORT,
          custom_id: 'name',
          label: 'Wer ist es?',
          placeholder: truncateString(target.nickname || target.user.username, 25),
          required: true
        }
      ]
    })
  }

  sendSubmitNameDialogue(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const name = polyfillGetSubmission('name', (<unknown> i as InteractionTypeModalSubmit).data.components)
    if (!name) return i.replyPrivately({ content: 'HUH?' })
    instance.state.names[instance.state.assignments[i.user.id]] = name
    this.updateNamingScreen(instance, i)
  }

  allNamesSubmitted(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    instance.state.currently = instance.players[~~(Math.random() * instance.players.length)].id

    i.edit({
      title: 'Super, wir wären so weit!',
      description: `Alle haben einen namen eingereicht, wir können starten!\n\n${instance.host} is unser Gastgeber heute, du wirst das Spiel leiten! Die grünen Knöpfe sind nur für den Gastgeber.`,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          label: 'Alles klar!',
          custom_id: Gaming.getCustomId(instance, this.updateGameScreen)
        }
      ]
    })
  }

  updateGameScreen(instance: GameInstance<State>, i: ReplyableComponentInteraction, guessedConfirm = false) {
    const currently = instance.players.find(p => p.id === instance.state.currently)
    i.edit({
      title: `Wer ist ${currently.nickname || currently.user.username}?`,
      description: `<@${instance.state.currently}>, du bist dran!`,
      components: [
        {
          type: ComponentType.BUTTON,
          style: guessedConfirm
            ? ButtonStyle.DANGER
            : ButtonStyle.SUCCESS,
          label: guessedConfirm
            ? 'Wirklich erraten?'
            : 'Erraten',
          custom_id: guessedConfirm
            ? Gaming.getCustomId(instance, this.clickOnGuessedConfirm)
            : Gaming.getCustomId(instance, this.clickOnGuessed)
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          label: 'Falsch, Weiter',
          custom_id: Gaming.getCustomId(instance, this.clickOnSkip)
        },
        {
          type: ComponentType.LINE_BREAK
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          label: 'Namen anzeigen',
          custom_id: Gaming.getCustomId(instance, this.clickShowNames),
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  clickOnGuessed(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    this.updateGameScreen(instance, i, true)
  }

  clickOnGuessedConfirm(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    instance.state.finished.push(instance.state.currently)
    this.nextPlayer(instance, i)
  }

  clickOnSkip(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    this.nextPlayer(instance, i)
  }

  nextPlayer(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (instance.state.finished.length === instance.players.length) {
      this.endGame(instance, i)
      return
    }

    let index = instance.players.findIndex(p => p.id === instance.state.currently)
    do index = (index + 1) % instance.players.length
    while (instance.state.finished.includes(instance.players[index].id))
    instance.state.currently = instance.players[index].id

    this.updateGameScreen(instance, i)
  }

  findNameGiver(instance: GameInstance<State>, forId: string): GuildMember {
    const id = Object.entries(instance.state.assignments).find(ass => ass[1] === forId)[0]
    return instance.players.find(p => p.id === id)
  }

  clickShowNames(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    i.replyPrivately({
      title: 'Wer sind die anderen?',
      description: instance.players
        .filter(p => p.id !== i.user.id)
        .map(p => `${p} ist **${instance.state.names[p.id]}**\n*Ausgesucht von ${this.findNameGiver(instance, p.id).user.username}*`)
        .join('\n\n')
    })
  }

  endGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    Gaming.finishGame(instance)

    const ranking = instance.state.finished
      .map((id, index) => `**${index + 1}.** <@${id}> war **${instance.state.names[id]}**\n*Ausgesucht von ${this.findNameGiver(instance, id).user.username}*`)
      .join('\n\n')

    i.edit({
      title: 'UUUUND FERTIG!',
      description: `STOPPT DIE UHR!\nOder so. Wir sind auf jeden Fall durch. Hier ist das Ranking:\n\n${ranking}`,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          label: 'Neue Runde',
          custom_id: Gaming.getCustomId(instance, this.newGame)
        }
      ]
    })
  }

  newGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    Gaming.relaunchGame(instance, i)
  }

}
