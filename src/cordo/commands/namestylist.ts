/* eslint-disable no-labels */
import axios from 'axios'
import { ButtonStyle, CommandInteraction, ComponentType, ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'
import { switchFont } from '../../lib/utils/string-utils'


const questions = [
  { id: 'cereal', text: 'What is the correct order?', options: [ 'Cereal, Milk, Spoon', 'Milk, Cereal, Spoon', 'Spoon, Cereal, Milk', 'Cereal, Spoon, Bowl' ] },
  { id: 'pizza', text: 'What is your favourite pizza topping?', options: [ 'Cheese', 'Pork', 'Vegetables', 'Pineapple' ] },
  { id: 'lose', text: 'What do you lose the most often?', options: [ 'Keys', 'Phone', 'Wallet', 'Will to live' ] },
  { id: 'animal', text: 'What is the best animal?', options: [ 'Cat', 'Dog', 'Turtle', 'Fish', 'Broccoli' ] },
  { id: 'color', text: 'Your favourite color?', options: [ 'Red', 'Green', 'Blue', 'Yellow' ] },
  { id: 'sport', text: 'Best sport?', options: [ 'Soccer / Football', 'Basketball', 'Swimming', 'Skiing' ] },
  { id: 'icecream', text: 'Best kind of ice cream?', options: [ 'Vanilla', 'Chocolate', 'Strawberry', 'The blue one', 'Something with alcohol' ] }
]

export default function (i: ReplyableCommandInteraction) {
  let finished = false
  let type = 'surprise'
  const typeTexts = {
    small: 'Small changes, noted.',
    big: 'Bigger adjustments while keeping elements of your current name... Okay!',
    new: 'Something very new, I\'m excited to give you a complete make-over!',
    surprise: 'A surprise! I am exited!'
  }

  const answers = {}
  // DO NOT CHANGE THE ORDER OF OPTIONS HERE WITHOUT CHANGING THE GENERATOR CODE BELOW!
  const quests: typeof questions = JSON.parse(JSON.stringify(questions)).sort(() => Math.random() - 0.5)

  i
    .replyInteractive({
      title: 'Holá!',
      description: 'I am the name stylist. Are you looking for a fresh, new style?',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          custom_id: 'start',
          label: 'Oh yes!'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'cancel',
          label: 'Naah thanks'
        }
      ]
    })
    .withTimeout(
      60e3,
      (j) => {
        if (finished) return
        j.edit({
          description: 'No answer? Okay well I guess you\'re not interested any more... Just hit me up again if you change your mind!',
          components: []
        })
      },
      { onInteraction: 'restartTimeout' }
    )
    .on('cancel', h => h.edit({
      description: 'Okie dokie! If you ever change your mind, hit me up!',
      components: []
    }))
    .on('start', h => h.edit({
      description: 'Okay alright... Tell me, are you looking for small adjustments or something new entirely?',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page2_small',
          label: 'Small Adjustments'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page2_big',
          label: 'Bigger Adjustments'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page2_new',
          label: 'Something new'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page2_surprise',
          label: 'Surprise me!'
        }
      ]
    }))
    .on('page2_$selection', (h) => {
      type = h.params.selection
      const question = quests[0]
      if (type === 'surprise') {
        for (let i = 0; i < 3; i++)
          answers[i] = quests[i].options[~~(Math.random() * quests[i].options.length)]
        h.edit({
          description: 'A surprise... Sure! Ready for your new look?',
          components: [
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.SUCCESS,
              custom_id: 'finish',
              label: 'I was born ready!'
            }
          ]
        })
      } else {
        h.edit({
          description: typeTexts[type] + '\nI\'ll be asking you a few questions now to get a feel for what you like an what you dont. Let\'s get started...\n' + question.text,
          components: question.options.map((o, it) => ({
            type: ComponentType.BUTTON,
            style: ButtonStyle.SECONDARY,
            custom_id: 'page3_' + it.toString(),
            label: o
          }))
        })
      }
    })
    .on('page3_$selection', (h) => {
      answers[quests[0].id] = h.params.selection
      const question = quests[1]
      h.edit({
        description: question.text,
        components: question.options.map((o, it) => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page4_' + it.toString(),
          label: o
        }))
      })
    })
    .on('page4_$selection', (h) => {
      answers[quests[1].id] = h.params.selection
      const question = quests[2]
      h.edit({
        description: question.text,
        components: question.options.map((o, it) => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page5_' + it.toString(),
          label: o
        }))
      })
    })
    .on('page5_$selection', (h) => {
      answers[quests[2].id] = h.params.selection
      h.edit({
        description: 'Okay alright, I think I have enough information to give you a glowing new look! Are you ready?',
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SUCCESS,
            custom_id: 'finish',
            label: 'I am ready!'
          }
        ]
      })
    })
    .on('finish', async (h) => {
      finished = true
      // const orgName = h.member.nick || h.user.username
      const orgName = h.user.username
      const name = (await generateName(orgName, type, answers, i)).substr(0, 32) || 'json derulo'
      const guild = await TudeBot.guilds.fetch(i.guild_id)
      const member = await guild.members.fetch(i.user.id)
      member.setNickname(name)
      h.edit({
        description: `Violá! There we go, here is your new name: \`${name}\`\nDo you like it? If not you can always come back again and get a new make-over!`,
        components: []
      })
    })

  return true
}

async function generateName(orgName: string, type: string, answers: Record<string, string>, i: CommandInteraction): Promise<string> {
  if (type === 'surprise')
    type = ([ 'small', 'big', 'new' ])[~~(Math.random() * 3)]

  if (type === 'small') {
    if (answers.animal && Math.random() < 0.7) {
      const emoji = ([ '😸', '🐶', '🐢', '🐠', '🥦' ])[answers.animal]
      if (Math.random() < 0.5) return emoji + ' ' + orgName
      else return orgName.substring(0, 30) + ' ' + emoji
    }
    if (answers.lose === '3') {
      if (Math.random() < 0.2) orgName = switchFont(orgName, Math.floor(Math.random() * 4))
      if (Math.random() < 0.3) return `😔 ${orgName.toLocaleLowerCase().split('').join(' ').substr(0, 28)} 😔`
      else return `😔 ${orgName.toLocaleLowerCase().substring(0, 28)} 🙏`
    }

    if (Math.random() < 0.1)
      orgName = orgName.toUpperCase()
    if (Math.random() < 0.1)
      orgName = orgName.toLowerCase()

    if (Math.random() < 0.3) {
      orgName = switchFont(orgName)
      if (Math.random() < 0.5) return orgName
    }

    const emojis = getEmojiPair()
    if (Math.random() < 0.5)
      return `${emojis[0]} ${orgName.substring(0, 28)} ${emojis[1]}`
    else
      return orgName.split('').join(emojis[0])
  }

  if (type === 'big') {
    const someNumber = Math.random() < 0.2 ? 0 : Math.random() < 0.3 ? 1 : Math.random()
    const emojis = getEmojiPair()
    if (answers.icecream === '3') return 'C0ckmaster 3000'
    if (Math.random() < 0.1) orgName = orgName.split('').reverse().join('')
    if (Math.random() < 0.3) orgName = orgName.split(/[aeiouAEIOU]/).join('')
    if (Math.random() < 0.3) orgName = orgName.split(' ').sort(() => Math.random() - 0.5).join(' ')
    if (Math.random() < 0.3) orgName = orgName.split('').map(c => Math.random() < someNumber ? c.toLowerCase() : c.toUpperCase()).join('')
    if (Math.random() < 0.3) orgName = orgName.split(orgName[~~(Math.random() * orgName.length)]).join(emojis[0])
    else if (Math.random() < 0.1) orgName = orgName.split('').map(c => switchFont(c)).join('')
    else if (Math.random() < 0.5) orgName = switchFont(orgName)
    if (Math.random() < 0.1) orgName = orgName.split(orgName[~~(Math.random() * orgName.length)]).join(emojis[1])

    if (Math.random() < 0.2) return generateName(orgName, 'small', answers, i)
    return orgName
  }

  if (type === 'new') {
    if (Math.random() < 0.3) {
      const anskeys = Object.keys(answers)
      const anskey = anskeys[~~(Math.random() * anskeys.length)]
      const ansval = questions.find(q => q.id === anskey)?.options[answers[anskey]] ?? i.member?.nick ?? i.user.username ?? 'cringe'
      return generateName(ansval, 'big', answers, i)
    }

    if (Math.random() < 0.1) {
      const guild = await TudeBot.guilds.fetch(i.guild_id)
      const members = [ ...guild.members.cache.values() ]
      const name = members[~~(Math.random() * members.length)]
      return generateName(name.user.username, 'big', answers, i)
    }

    const url = Math.random() < 0.5
      ? 'https://raw.githubusercontent.com/duyet/bruteforce-database/master/usernames.txt'
      : 'https://raw.githubusercontent.com/jeanphorn/wordlist/master/usernames.txt'

    const { data: list } = await axios.get(url, { validateStatus: null })
    if (!list?.length) return generateName('json derulo', 'big', answers, i)
    const lines: string[] = list.split('\n')
    const line = lines[~~(Math.random() * lines.length)]
    return generateName(line, 'big', answers, i)
  }

  return type + ' ' + JSON.stringify(answers)
}

function getEmojiPair(): [ string, string ] {
  const emojis = '👅 👄 👁️ 🌵 🍄 💐 🐳 🐋 🐍 🐌 🦆 🐦 ⚡ ✨ 🔥 🪐 💫 ☀️ 🌊 💦 🌜 🍒 🍉 🥥 🍕 🍔 🍿 🍬 🗿 🏖️ 🗼 🚀 💸 💻 ⛏️ 💎 🔮 🗡️ ⚔️ 🛡️ 🎁 ❤️ 🧡 💛 💚 💙 💜 🖤 🤎 🤍 💖 ⚠️ ♻️'.split(' ')
  const id = Math.floor(Math.random() * (emojis.length - 1))
  return [ emojis[id], emojis[id + 1] ].sort(() => Math.random() - 0.5) as [string, string]
}
