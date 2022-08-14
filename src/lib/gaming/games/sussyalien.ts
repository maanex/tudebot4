import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionTypeModalSubmit, MessageComponent, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import { shuffleArray } from '../../utils/array-utils'
import { polyfillGetSubmission } from '../../utils/cordo-utils'
import { switchFont, truncateString } from '../../utils/string-utils'
import { Game, GameInfo, GameInstance, GameOption, Gaming } from '../gaming'


type State = {
  questions: {
    authorId: string
    question: string
    aliens: string[]
    // [user, answer]
    answers: [string, string][]
    // guesser -> list of guessed aliens
    alienGuesses: Record<string, string[]>
  }[]
  // user id -> list of question indexes
  innocentAnswerMap: Record<string, number[]>
  // user id -> list of question indexes
  alienAnswerMap: Record<string, number[]>
  mainMessageInteraction: ReplyableComponentInteraction
  phase: 'innocent' | 'alien'
  votingAtIndex: number
}

const introText = 'Es haben sich Aliens auf euer Raumschiff geschlichen, wir werden einen Test durchführen der hoffentlich alle Aliens ans Licht führt. Da bei diesem Spiel viel gewartet werden muss, spielen wir mehrere Runden gleichzeitig. Klingt kompliziert, ist es aber nicht.\nFangen wir gleich an, alles andere erklärt sich dann im laufe des Spieles. Als erstes muss sich jeder von euch eine Frage überlegen die den anderen mitspielern gestellt wird.\n*Welche Fragen gut geeignet sind wird sich nach dem ersten mal Spielen zeigen*\nAlle nicht-aliens bekommen dann die Frage gestellt und dürfen sie beantworten. Sobald das geschehen ist bekommen die Aliens nur die Antworten der anderen Spieler, aber nicht die Frage selbst. Ihre Antwort ist hoffentlich so unpassend, dass es ihre wahre Identität ans Licht führt.\nAlso gut, los gehts: **denk dir eine gute Frage aus:**'

export default class SussyalienGame implements Game<State> {

  public info: GameInfo = {
    id: 'sussyalien',
    name: 'Sussy Alien',
    descriptionShort: 'TODO',
    descriptionLong: 'You are in a spaceship but something is sussy. You suspect there are imposers among us :scream:\nYour entire crew gets put on a test to find and eliminate the aliens.',
    icon: '👽',
    minPlayers: 3,
    maxPlayers: 20,
    languages: [ 'en', 'de' ],
    enabled: true
  }

  public options: GameOption[] = [
    {
      name: 'Alien Count',
      id: 'alien_count',
      description: 'How many aliens are among us.',
      options: [
        {
          label: 'One',
          value: '1',
          default: true
        },
        {
          label: 'Two',
          value: '2'
        },
        {
          label: 'Three',
          value: '3'
        },
        {
          label: 'Random between 0 and 1',
          value: 'rand_0_1'
        },
        {
          label: 'Random between 0 and 2',
          value: 'rand_0_2'
        },
        {
          label: 'Random between 0 and 3',
          value: 'rand_0_3'
        },
        {
          label: 'Random between 1 and 2',
          value: 'rand_1_2'
        },
        {
          label: 'Random between 1 and 3',
          value: 'rand_1_3'
        }
      ]
    }
  ]

  createInitialState(): State {
    return {
      questions: [],
      innocentAnswerMap: {},
      alienAnswerMap: {},
      mainMessageInteraction: null,
      phase: 'innocent',
      votingAtIndex: 0
    }
  }

  startGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    i.edit({
      title: 'Willkommen :alien:',
      description: introText,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          label: 'Frage einreichen',
          custom_id: Gaming.getCustomId(instance, this.openQuestionModal),
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  openQuestionModal(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    i.openModal({
      title: 'Frage überlegt?',
      custom_id: CordoAPI.compileCustomId(Gaming.getCustomId(instance, this.submitQuestionModal), [ InteractionComponentFlag.ACCESS_EVERYONE ]),
      components: [
        {
          type: ComponentType.TEXT,
          style: TextInputStyle.PARAGRAPH,
          label: 'Deine Frage:',
          custom_id: 'question',
          placeholder: 'Wo kann man am besten wandern gehen?'
        }
      ]
    })
  }

  updateQuestionsScreen(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const notSubmitted = instance.players.filter(p => !instance.state.questions.some(q => q.authorId === p.id))

    if (notSubmitted.length === 0) return this.allQuestionsSubmitted(instance, i)

    const text = (notSubmitted.length > 3)
      ? `Wir warten auf ${notSubmitted} weitere Leute...`
      : `Wir warten noch auf ${notSubmitted.join(', ')}`

    i.edit({
      title: 'Willkommen :alien:',
      description: `${introText}\n\n${text}`
    })
  }

  submitQuestionModal(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const question = polyfillGetSubmission('question', (<unknown> i as InteractionTypeModalSubmit).data.components)
    if (!question) return i.replyPrivately({ content: 'HUH?' })

    const found = instance.state.questions.find(q => q.authorId === i.user.id)
    if (found) found.question = question
    else instance.state.questions.push({ authorId: i.user.id, question, aliens: [], answers: [], alienGuesses: {} })

    this.updateQuestionsScreen(instance, i)
  }

  allQuestionsSubmitted(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    this.assignInnocentQuestions(instance)
    instance.state.mainMessageInteraction = i

    i.edit({
      title: 'Super, wir haben alle',
      description: 'Dann könnt ihr jetzt anfangen Fragen zu beantworten.\nDafür bitte einmal auf den Knopf unten drücken. Nachdem wir mehrere Runden gleichzeitig spielen wirst du auch mehrere verschiedene Fragen bekommen, die du alle beantworten musst.\n*Bitte die Fragen nicht aus lauter enthusiasmus laut vorlesen, es sind Imposter im Raum :alien:*',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          custom_id: Gaming.getCustomId(instance, this.showNextQuestion),
          label: 'Fragen Anzeigen',
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  assignInnocentQuestions(instance: GameInstance<State>) {
    shuffleArray(instance.state.questions)
    const questions = instance.state.questions
    const players = questions.map(q => q.authorId)
    // we now have two arrays, one with questions, one with users. Same index = they belong together

    const countStr = instance.config.alien_count

    for (let i = 0; i < questions.length; i++) {
      const quest = questions[i]

      let count = 0

      if (countStr.startsWith('rand')) {
        switch (countStr) {
          case 'rand_0_1': count = ~~(Math.random() * 1) + 0; break
          case 'rand_0_2': count = ~~(Math.random() * 2) + 0; break
          case 'rand_0_3': count = ~~(Math.random() * 3) + 0; break
          case 'rand_1_2': count = ~~(Math.random() * 1) + 1; break
          case 'rand_1_3': count = ~~(Math.random() * 3) + 1; break
          default: count = 1
        }
      } else {
        count = Number(countStr)
      }

      for (let j = 0; j < count; j++) {
        let idx = i + j * 2 + 1
        if (idx % players.length === i) idx++
        quest.aliens.push(players[idx % players.length])
      }
    }

    shuffleArray(instance.state.questions)

    for (const question of instance.state.questions) {
      const player = question.authorId
      const toAnswerInno: number[] = []
      const toAnswerAlien: number[] = []
      for (let i = 0; i < instance.state.questions.length; i++) {
        if (instance.state.questions[i].aliens.includes(player))
          toAnswerAlien.push(i)
        else
          toAnswerInno.push(i)
      }
      instance.state.innocentAnswerMap[player] = toAnswerInno
      instance.state.alienAnswerMap[player] = toAnswerAlien
    }
  }

  showNextQuestion(instance: GameInstance<State>, i: ReplyableComponentInteraction, firstOne = true) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap
    const question = map[i.user.id].length
      ? instance.state.questions[map[i.user.id][0]]
      : null

    if (!question)
      return this.userDoneWithQuestions(instance, i)

    const alienView = instance.state.phase === 'alien'
    const alienFont = alienView
      ? shuffleArray('Ä฿₵ＤєғĠнłᒍӄﾚʍᑎ⊙₱ႳＲᏕȶɄѴχᎽᘔᗩᗷᑢᕲᘿᖴᘜᕼᓰᒚkᒪᘻᘉᓍᕵᕴᖇSᖶᑘᐺ᙭ᖻᗱ'.split('')).join('')
      : ''

    const content = {
      title: firstOne
        ? 'Hi, los gehts:'
        : question
          ? 'Okay, nächste Frage:'
          : 'Hui',
      description: alienView
        ? `> ${switchFont(question.question, alienFont)}${'?'.repeat(~~(Math.random() * 6) + 1)}\n\nAntworten der anderen:\n**${question.answers.map(a => a[1]).join('       ')}**`
        : question
          ? `> ${question.question}${question.question.endsWith('?') ? '' : '?'}`
          : 'Du bist fertig, erstmal. Wir warten noch schnell auf den Rest!',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          custom_id: Gaming.getCustomId(instance, this.openQuestionAnswerModal),
          label: 'Beantworten',
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ] as MessageComponent[]
    }

    if (firstOne) i.replyPrivately(content)
    else i.edit(content)
  }

  openQuestionAnswerModal(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap

    i.openModal({
      title: 'Zur Frage...',
      custom_id: CordoAPI.compileCustomId(Gaming.getCustomId(instance, this.submitQuestionAnswer), [ InteractionComponentFlag.ACCESS_EVERYONE ]),
      components: [
        {
          type: ComponentType.TEXT,
          style: TextInputStyle.PARAGRAPH,
          custom_id: 'answer',
          placeholder: instance.state.questions[map[i.user.id][0]].question,
          label: 'Deine Antwort'
        }
      ]
    })
  }

  submitQuestionAnswer(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const answer = polyfillGetSubmission('answer', (<unknown> i as InteractionTypeModalSubmit).data.components)
    if (!answer) return i.replyPrivately({ content: 'HUH?' })

    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap

    const questionId = map[i.user.id].shift()
    instance.state.questions[questionId].answers.push([ i.user.id, answer ])
    this.showNextQuestion(instance, i, false)
  }

  userDoneWithQuestions(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap

    i.edit({
      title: 'Fertig!',
      description: 'Du kannst dieses Fenster jetzt schließen. Einfach unten auf den kleinen blauen text klicken ↓',
      components: []
    })

    const notSubmitted = instance.players.filter(p => !!map[p.id].length)

    if (notSubmitted.length === 0) return this.allUsersDoneWithQuestions(instance, instance.state.mainMessageInteraction)

    const text = (notSubmitted.length > 3)
      ? `Wir warten auf ${notSubmitted.length} weitere Leute...`
      : `Wir warten noch auf ${notSubmitted.join(', ')}`

    instance.state.mainMessageInteraction.edit({
      title: 'Super, wir haben alle',
      description: `Dann könnt ihr jetzt anfangen Fragen zu beantworten.\nDafür bitte einmal auf den Knopf unten drücken. Nachdem wir mehrere Runden gleichzeitig spielen wirst du auch mehrere verschiedene Fragen bekommen, die du alle beantworten musst.\n*Bitte die Fragen nicht aus lauter enthusiasmus laut vorlesen, es sind Imposter im Raum :alien:*\n\n${text}`
    })
  }

  allUsersDoneWithQuestions(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (instance.state.phase === 'innocent') {
      instance.state.phase = 'alien'
      i.edit({
        title: 'Alle fertig!',
        description: 'Zeit für die Aliens! :alien:\n\nDu bekommst nun wieder eine oder mehrere Fragen vorgelegt. Allerdings verstehst du als alien die Sprache nicht, musst dir also nur anhand der Antworten anderer Spieler eine Antwort überlegen. Los gehts!',
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.PRIMARY,
            custom_id: Gaming.getCustomId(instance, this.showNextQuestion),
            label: 'Fragen Anzeigen',
            flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
          }
        ]
      })
    } else if (instance.state.phase === 'alien') {
      i.edit({
        title: 'Beep boop',
        description: `Die Aliens sind fertig. Zeit für die Ergebnisse.\n\nIhr bekommt nun der Reihe nach alle Fragen präsentiert. In der Liste seht ihr eure Mitspieler sowie deren Antworten. Wählt die Mitspieler aus, von denen ihr denkt, dass sie aliens sind.\nVorsicht: Die Aliens unterscheiden sich eventuell von Frage zu Frage!\n\nBereit? ${instance.host} bitte drücke den Knopf, wenn ihr alle so weit seid!`,
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SUCCESS,
            custom_id: Gaming.getCustomId(instance, this.showVoting),
            label: 'Starten'
          }
        ]
      })
    }
  }

  getUsername(instance: GameInstance<State>, id: string) {
    const u = instance.players.find(p => p.id === id)
    return u.nickname || u.user.username
  }

  showVoting(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    if (instance.state.votingAtIndex >= instance.state.questions.length)
      return this.gameDone(instance, i)

    const question = instance.state.questions[instance.state.votingAtIndex]
    const answers = [ ...question.answers ]
    shuffleArray(answers)

    const notSubmitted = instance.players.filter(p => !question.alienGuesses[p.id])
    if (notSubmitted.length === 0) return this.votingIterationDone(instance, instance.state.mainMessageInteraction)

    const text = (notSubmitted.length === instance.players.length)
      ? ''
      : (notSubmitted.length > 3)
          ? `Wir warten auf ${notSubmitted.length} weitere Leute...`
          : `Wir warten noch auf ${notSubmitted.join(', ')}`

    i.edit({
      title: `Frage ${instance.state.votingAtIndex + 1}/${instance.state.questions.length}`,
      description: `*Jemand möchte wissen:*\n> **${question.question}**\n\nHier sind eure Antworten. Wer ist ein Alien?\n\n${text}`,
      components: [
        {
          type: ComponentType.SELECT,
          custom_id: Gaming.getCustomId(instance, this.submitVotingGuess),
          min_values: 1,
          max_values: answers.length + 1,
          options: [
            ...answers.map(([ userId, answer ]) => ({
              label: this.getUsername(instance, userId),
              description: `"${truncateString(answer, 48)}"`,
              value: userId
            })),
            {
              label: 'Niemand',
              description: 'Wenn du glaubst, dass Aliens nicht existieren.',
              value: 'none'
            }
          ],
          flags: [ InteractionComponentFlag.ACCESS_EVERYONE ]
        }
      ]
    })
  }

  submitVotingGuess(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    const guesses = i.data.values
    if (guesses.includes('none'))
      guesses.splice(guesses.indexOf('none'), 1)

    const question = instance.state.questions[instance.state.votingAtIndex]
    question.alienGuesses[i.user.id] = guesses

    this.showVoting(instance, i)
  }

  getRandomFace() {
    const base = [ '🧔', '👱' ]
    const hair = [ '🦳', '🦲', '🦱', '🦰' ]
    const color = [ '', '🏽', '🏼', '🏻', '🏾', '🏾' ]

    if (Math.random() < 0.1) return base[~~(Math.random() * base.length)] + color[~~(Math.random() * color.length)]
    else return '🧑' + color[~~(Math.random() * color.length)] + '‍' + hair[~~(Math.random() * hair.length)]
  }

  votingIterationDone(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const question = instance.state.questions[instance.state.votingAtIndex]

    const answers = question.answers
      .map(([ userId, answer ]) => {
        const isAlien = question.aliens.includes(userId)
        const face = isAlien ? '👽' : this.getRandomFace()
        const author = this.getUsername(instance, userId)
        const votes = Object
          .entries(question.alienGuesses)
          .map(([ who, guess ]) => {
            const vote = guess.includes(userId) ? '✓ ' : '✗ '
            const correct = (guess.includes(userId) === isAlien)
            return correct
              ? `[${vote} ${this.getUsername(instance, who)}](http://a)`
              : `${vote} ${this.getUsername(instance, who)}`
          })
          .join('   ')
        return `${face} **${author}** — "${answer}"\n${votes}`
      })

    instance.state.votingAtIndex++

    i.edit({
      title: `Frage ${instance.state.votingAtIndex}/${instance.state.questions.length}`,
      description: `**${this.getUsername(instance, question.authorId)}**: ${question.question}\n\n${answers.join('\n\n')}`,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          custom_id: Gaming.getCustomId(instance, this.showVoting),
          label: 'Weiter'
        }
      ]
    })
  }

  gameDone(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    i.edit({
      title: 'Das war\'s',
      // TODO
      description: 'Danke fürs spielen, hier kommen noch punkte',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          custom_id: Gaming.getCustomId(instance, this.newGame),
          label: 'Nochmal Spielen'
        }
      ]
    })
  }

  newGame(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    Gaming.relaunchGame(instance, i)
  }

  // TODO missing:
  // - punktesystem -> richtig falsch geraten
  // - doppelte einreichung von innocents -> beide 0 punkte -> diverse antworten gesucht
  // - alien darf nicht die selbe antwort einreichen die schon ein innocent gegeben hat

}
