/* eslint-disable no-irregular-whitespace */
import { ButtonStyle, ComponentType, InteractionComponentFlag, InteractionTypeModalSubmit, MessageComponent, ReplyableComponentInteraction, TextInputStyle } from 'cordo'
import CordoAPI from 'cordo/dist/api'
import { shuffleArray } from '../../utils/array-utils'
import { polyfillGetSubmission } from '../../utils/cordo-utils'
import { truncateString } from '../../utils/string-utils'
import { Game, GameInfo, GameInstance, GameOption, Gaming } from '../gaming'


type State = {
  questions: {
    authorId: string
    question: string
    aliens: string[]
    // [user, answer, isAlien]
    answers: [string, string, boolean][]
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
  globalPoints: Record<string, number>
}

const introText = 'Es haben sich Aliens auf euer Raumschiff geschlichen, wir werden einen Test durchführen der hoffentlich alle Aliens ans Licht führt. Da bei diesem Spiel viel gewartet werden muss, spielen wir mehrere Runden gleichzeitig. Klingt kompliziert, ist es aber nicht.\nFangen wir gleich an, alles andere erklärt sich dann im laufe des Spieles. Als erstes muss sich jeder von euch eine Frage überlegen die den anderen mitspielern gestellt wird.\n*Welche Fragen gut geeignet sind wird sich nach dem ersten mal Spielen zeigen*\nAlle nicht-aliens bekommen dann die Frage gestellt und dürfen sie beantworten. Sobald das geschehen ist bekommen die Aliens nur die Antworten der anderen Spieler, aber nicht die Frage selbst. Ihre Antwort ist hoffentlich so unpassend, dass es ihre wahre Identität ans Licht führt.\nAlso gut, los gehts: **denk dir eine gute Frage aus:**'

const maxAnswerLength = 25

const pointTable = {
  SAME_ANSWER: -2,

  GOT_GUESSED_CORRECTLY_ALIEN: -1,
  GOT_GUESSED_FALSELY_ALIEN: 1,

  GOT_GUESSED_CORRECTLY_INNOCENT: 0,
  GOT_GUESSED_FALSELY_INNOCENT: -1,

  GUESSED_CORRECTLY_ALIEN: 1,
  GUESSED_FALSELY_ALIEN: 0,

  GUESSED_CORRECTLY_INNOCENT: 1,
  GUESSED_FALSELY_INNOCENT: 0
}

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
    estTime: '10-20 min',
    enabled: true
  }

  public options: GameOption[] = [
    {
      name: 'Alien Count',
      id: 'alienCount',
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
          label: 'Four',
          value: '4'
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
          label: 'Random between 0 and 4',
          value: 'rand_0_4'
        },
        {
          label: 'Random between 0 and 5',
          value: 'rand_0_5'
        },
        {
          label: 'Random between 1 and 2',
          value: 'rand_1_2'
        },
        {
          label: 'Random between 1 and 3',
          value: 'rand_1_3'
        },
        {
          label: 'Random between 1 and 4',
          value: 'rand_1_4'
        },
        {
          label: 'Random between 1 and 5',
          value: 'rand_1_5'
        },
        {
          label: 'Random between 2 and 3',
          value: 'rand_2_3'
        },
        {
          label: 'Random between 2 and 4',
          value: 'rand_2_4'
        },
        {
          label: 'Random between 2 and 5',
          value: 'rand_2_5'
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
      votingAtIndex: 0,
      globalPoints: {}
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

    const countStr = instance.config.alienCount

    for (let i = 0; i < questions.length; i++) {
      const quest = questions[i]

      let count = 0

      if (countStr.startsWith('rand')) {
        switch (countStr) {
          case 'rand_0_1': count = ~~(Math.random() * 2) + 0; break
          case 'rand_0_2': count = ~~(Math.random() * 3) + 0; break
          case 'rand_0_3': count = ~~(Math.random() * 4) + 0; break
          case 'rand_0_4': count = ~~(Math.random() * 5) + 0; break
          case 'rand_0_5': count = ~~(Math.random() * 6) + 0; break
          case 'rand_1_2': count = ~~(Math.random() * 2) + 1; break
          case 'rand_1_3': count = ~~(Math.random() * 4) + 1; break
          case 'rand_1_4': count = ~~(Math.random() * 5) + 1; break
          case 'rand_1_5': count = ~~(Math.random() * 6) + 1; break
          case 'rand_2_3': count = ~~(Math.random() * 4) + 2; break
          case 'rand_2_4': count = ~~(Math.random() * 5) + 2; break
          case 'rand_2_5': count = ~~(Math.random() * 6) + 2; break
          default: count = 1
        }
      } else {
        count = Number(countStr)
      }

      for (let j = 0; j < count; j++) {
        let idx = i + j * (players.length > 4 ? 2 : 1) + 1
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

  showNextQuestion(instance: GameInstance<State>, i: ReplyableComponentInteraction, firstOne = true, invalidSubmission = false) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap
    const question = map[i.user.id].length
      ? instance.state.questions[map[i.user.id][0]]
      : null

    if (!question)
      return this.userDoneWithQuestions(instance, i, firstOne)

    const alienView = instance.state.phase === 'alien'
    const invalidText = invalidSubmission
      ? '⚠️ Deine Antwort ist zu ähnlich zu einer der Vorgegebenen. Werde etwas kreativer!'
      : ''

    const content = {
      title: firstOne
        ? 'Hi, los gehts:'
        : question
          ? 'Okay, nächste Frage:'
          : 'Hui',
      description: alienView
        ? `> ${'?'.repeat(~~(Math.random() * 9) + 3)}\n\nAntworten der anderen:\n**${question.answers.filter(a => !a[2]).map(a => a[1]).join('       ')}**\n\n${invalidText}`
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

    if (!instance.state.questions[map[i.user.id][0]])
      return this.showNextQuestion(instance, i, false)

    const isAlien = (instance.state.phase === 'alien')

    i.openModal({
      title: 'Zur Frage...',
      custom_id: CordoAPI.compileCustomId(Gaming.getCustomId(instance, this.submitQuestionAnswer), [ InteractionComponentFlag.ACCESS_EVERYONE ]),
      components: [
        {
          type: ComponentType.TEXT,
          style: TextInputStyle.PARAGRAPH,
          custom_id: 'answer',
          max_length: maxAnswerLength,
          placeholder: isAlien
            ? '??????'
            : instance.state.questions[map[i.user.id][0]].question,
          label: 'Deine Antwort'
        }
      ]
    })
  }

  stringFuzzyEquals(str1: string, str2: string): boolean {
    str1 = str1.toLowerCase().replace(/[^\w\d]/gi, '')
    str2 = str2.toLowerCase().replace(/[^\w\d]/gi, '')
    return str1 === str2
  }

  submitQuestionAnswer(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const answer = polyfillGetSubmission('answer', (<unknown> i as InteractionTypeModalSubmit).data.components)
    if (!answer) return i.replyPrivately({ content: 'HUH?' })

    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap

    const alienTime = (instance.state.phase === 'alien')

    if (alienTime) {
      // check if they're submitting the exact same as an already provided answer
      for (const ans of instance.state.questions[map[i.user.id][0]].answers) {
        // answer is by another alien -> skipping
        if (ans[2]) continue
        if (this.stringFuzzyEquals(ans[1], answer)) return this.showNextQuestion(instance, i, false, true)
      }
    }

    const questionId = map[i.user.id].shift()
    instance.state.questions[questionId].answers.push([ i.user.id, answer, alienTime ])
    this.showNextQuestion(instance, i, false)
  }

  userDoneWithQuestions(instance: GameInstance<State>, i: ReplyableComponentInteraction, firstOne) {
    const map = instance.state.phase === 'innocent'
      ? instance.state.innocentAnswerMap
      : instance.state.alienAnswerMap

    ;(firstOne ? i.replyPrivately : i.edit)({
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

  showVoting(instance: GameInstance<State>, i: ReplyableComponentInteraction, firstTime = true) {
    if (Gaming.gatekeepPlayers(instance, i)) return

    if (instance.state.votingAtIndex >= instance.state.questions.length)
      return this.gameDone(instance, i)

    const question = instance.state.questions[instance.state.votingAtIndex]
    const answers = [ ...question.answers ]

    const notSubmitted = instance.players.filter(p => !question.alienGuesses[p.id])
    if (notSubmitted.length === 0) return this.votingIterationDone(instance, instance.state.mainMessageInteraction)

    if (firstTime)
      shuffleArray(answers)

    const text = (notSubmitted.length === instance.players.length)
      ? ''
      : (notSubmitted.length > 3)
          ? `Wir warten auf ${notSubmitted.length} weitere Leute...`
          : `Wir warten noch auf ${notSubmitted.join(', ')}`

    const answersString = answers
      .map(([ userId, answer ]) => `👤 **${this.getUsername(instance, userId)}** — "${answer}"`)
      .join('\n\n')

    i.edit({
      title: `Frage ${instance.state.votingAtIndex + 1}/${instance.state.questions.length}`,
      description: `> ${question.question}\n\n${answersString}\n\nWer ist ein Alien?\n\n${text}`,
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

    i.ack()
    this.showVoting(instance, i, false)
  }

  getRandomFace() {
    const base = [ '🧔', '👱' ]
    const hair = [ '🦳', '🦲', '🦱', '🦰' ]
    const color = [ '', '🏽', '🏼', '🏻', '🏾', '🏾' ]

    if (Math.random() < 0.1) return base[~~(Math.random() * base.length)] + color[~~(Math.random() * color.length)]
    else return '🧑' + color[~~(Math.random() * color.length)] + '‍' + hair[~~(Math.random() * hair.length)]
  }

  // userid -> [ point delta +-, whether or not same answer as someone else ]
  countPointsForCurrentRound(instance: GameInstance<State>): Record<string, [ number, boolean ]> {
    const question = instance.state.questions[instance.state.votingAtIndex]

    const users: Record<string, [ number, boolean ]> = {}
    for (const answer of question.answers)
      users[answer[0]] = [ 0, false ]

    for (const answer of question.answers) {
      const [ userId, text ] = answer
      const isAlien = question.aliens.includes(userId)

      for (const compareTo of question.answers) {
        if (compareTo[0] === userId) continue
        if (this.stringFuzzyEquals(text, compareTo[1])) {
          users[userId][1] = true
          users[userId][0] += pointTable.SAME_ANSWER
          break
        }
      }

      for (const guesser in question.alienGuesses) {
        const guess = question.alienGuesses[guesser].includes(userId)
        if (isAlien) {
          if (guess) {
            users[userId][0] += pointTable.GOT_GUESSED_CORRECTLY_ALIEN
            users[guesser][0] += pointTable.GUESSED_CORRECTLY_ALIEN
          } else {
            users[userId][0] += pointTable.GOT_GUESSED_FALSELY_ALIEN
            users[guesser][0] += pointTable.GUESSED_FALSELY_ALIEN
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (guess) {
            users[userId][0] += pointTable.GOT_GUESSED_FALSELY_INNOCENT
            users[guesser][0] += pointTable.GUESSED_FALSELY_INNOCENT
          } else {
            users[userId][0] += pointTable.GOT_GUESSED_CORRECTLY_INNOCENT
            users[guesser][0] += pointTable.GUESSED_CORRECTLY_INNOCENT
          }
        }
      }
    }

    return users
  }

  votingIterationDone(instance: GameInstance<State>, i: ReplyableComponentInteraction) {
    const question = instance.state.questions[instance.state.votingAtIndex]
    const points = this.countPointsForCurrentRound(instance)

    for (const user in points) {
      if (!instance.state.globalPoints[user])
        instance.state.globalPoints[user] = 0
      instance.state.globalPoints[user] += points[user][0]
    }

    const answers = question.answers
      .map(([ userId, answer ]) => {
        const isAlien = question.aliens.includes(userId)
        const face = isAlien ? '👽' : this.getRandomFace()
        const author = this.getUsername(instance, userId)
        const votes = Object
          .entries(question.alienGuesses)
          .map(([ who, guess ]) => {
            const vote = (who === userId)
              ? '    '
              : guess.includes(userId)
                ? '✓'
                : '✗'
            const correct = (guess.includes(userId) === isAlien)

            let text = `${vote} ${this.getUsername(instance, who)}`
            if (who === userId || correct) text = `[${text}](http://a)`

            return text
          })
          .join('   ')

        const double = points[userId][1]
        const answerFormatted = double
          ? `~~"${answer}"~~`
          : `"${answer}"`
        const score = points[userId][0] > 0
          ? `+${points[userId][0]}`
          : points[userId][0]
        return `${face} **${author}** — ${answerFormatted}   **${score}**\n${votes}`
      })

    instance.state.votingAtIndex++

    i.edit({
      title: `Frage ${instance.state.votingAtIndex}/${instance.state.questions.length}`,
      description: `**${this.getUsername(instance, question.authorId)}** wollte wissen:\n> ${question.question}\n\n${answers.join('\n\n')}`,
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
    const sumup = Object
      .entries(instance.state.globalPoints)
      .sort(([ _k1, v1 ], [ _k2, v2 ]) => (v2 - v1))
      .map(([ k, v ], i) => `${i + 1}. **${this.getUsername(instance, k)}:** ${v} Punkte`)

    i.edit({
      title: 'Das wars',
      description: `Danke fürs spielen.\n\n${sumup.join('\n')}`,
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
  // 0 aliens -> fehler
  // Zu lange frage: "Wie viel Bargeld liegt in dem Zimmer in dem du gerade bist? (in Euro, bitte nur die Zahl angeben lol)"" > 100
  // sortierung geht kaputt -> letzen beiden immer aliens

  
ki099  /usr/tudebot/build/lib/gaming/games/sussyalien.js:169
ki099              if (countStr.startsWith('rand')) {
ki099                           ^
ki099  
ki099  TypeError: Cannot read property 'startsWith' of undefined
ki099      at SussyalienGame.assignInnocentQuestions (/usr/tudebot/build/lib/gaming/games/sussyalien.js:169:26)
ki099      at SussyalienGame.allQuestionsSubmitted (/usr/tudebot/build/lib/gaming/games/sussyalien.js:145:14)
ki099      at SussyalienGame.updateQuestionsScreen (/usr/tudebot/build/lib/gaming/games/sussyalien.js:124:25)
ki099      at SussyalienGame.submitQuestionModal (/usr/tudebot/build/lib/gaming/games/sussyalien.js:142:14)
ki099      at Object.default_1 [as handler] (/usr/tudebot/build/cordo/components/gaming/r/$uid_$func.js:13:11)
ki099      at Function.findAndExecuteHandler (/usr/tudebot/node_modules/cordo/dist/manager/components.js:78:31)
ki099      at Function.onComponent (/usr/tudebot/node_modules/cordo/dist/manager/components.js:49:32)
ki099      at runMicrotasks (<anonymous>)
ki099      at processTicksAndRejections (node:internal/process/task_queues:96:5)
ki099  npm notice

}
