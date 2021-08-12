/* eslint-disable no-labels */
import axios from 'axios'
import { ButtonStyle, CommandInteraction, ComponentType, ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'


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
  const quests = JSON.parse(JSON.stringify(questions)).sort(() => Math.random() - 0.5)

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
    .withTimeout(60e3, (j) => {
      if (finished) return
      j.edit({
        description: 'No answer? Okay well I guess you\'re not interested any more... Just hit me up again if you change your mind!',
        components: []
      })
    }, { onInteraction: 'restartTimeout' }
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
      h.edit({
        description: typeTexts[type] + '\nI\'ll be asking you a few questions now to get a feel for what you like an what you dont. Let\'s get started...\n' + question.text,
        components: question.options.map((o, it) => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'page3_' + it.toString(),
          label: o
        }))
      })
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

  console.log(answers)

  if (type === 'small') {
    if (answers.animal && Math.random() < 0.7) {
      const emoji = ([ '😸', '🐶', '🐢', '🐠', '🥦' ])[answers.animal]
      if (Math.random() < 0.5) return emoji + ' ' + orgName
      else return orgName.substr(0, 30) + ' ' + emoji
    }
    if (answers.lose === '3') {
      if (Math.random() < 0.2) orgName = switchFont(orgName, Math.floor(Math.random() * 4))
      if (Math.random() < 0.3) return `😔 ${orgName.toLocaleLowerCase().split('').join(' ').substr(0, 28)} 😔`
      else return `😔 ${orgName.toLocaleLowerCase().substr(0, 28)} 🙏`
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
      return `${emojis[0]} ${orgName.substr(0, 28)} ${emojis[1]}`
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
      const ansval = questions.find(q => q.id === anskey).options[answers[anskey]]
      return generateName(ansval, 'big', answers, i)
    }

    if (Math.random() < 0.1) {
      const guild = await TudeBot.guilds.fetch(i.guild_id)
      const members = guild.members.cache.array()
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

function switchFont(text: string, font?: number) {
  const base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const fonts = [
    /*  0 */ '𝔞 𝔟 𝔠 𝔡 𝔢 𝔣 𝔤 𝔥 𝔦 𝔧 𝔨 𝔩 𝔪 𝔫 𝔬 𝔭 𝔮 𝔯 𝔰 𝔱 𝔲 𝔳 𝔴 𝔵 𝔶 𝔷 𝔄 𝔅 ℭ 𝔇 𝔈 𝔉 𝔊 ℌ ℑ 𝔍 𝔎 𝔏 𝔐 𝔑 𝔒 𝔓 𝔔 ℜ 𝔖 𝔗 𝔘 𝔙 𝔚 𝔛 𝔜 ℨ 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /*  1 */ '𝖆 𝖇 𝖈 𝖉 𝖊 𝖋 𝖌 𝖍 𝖎 𝖏 𝖐 𝖑 𝖒 𝖓 𝖔 𝖕 𝖖 𝖗 𝖘 𝖙 𝖚 𝖛 𝖜 𝖝 𝖞 𝖟 𝕬 𝕭 𝕮 𝕯 𝕰 𝕱 𝕲 𝕳 𝕴 𝕵 𝕶 𝕷 𝕸 𝕹 𝕺 𝕻 𝕼 𝕽 𝕾 𝕿 𝖀 𝖁 𝖂 𝖃 𝖄 𝖅 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /*  2 */ '𝓪 𝓫 𝓬 𝓭 𝓮 𝓯 𝓰 𝓱 𝓲 𝓳 𝓴 𝓵 𝓶 𝓷 𝓸 𝓹 𝓺 𝓻 𝓼 𝓽 𝓾 𝓿 𝔀 𝔁 𝔂 𝔃 𝓐 𝓑 𝓒 𝓓 𝓔 𝓕 𝓖 𝓗 𝓘 𝓙 𝓚 𝓛 𝓜 𝓝 𝓞 𝓟 𝓠 𝓡 𝓢 𝓣 𝓤 𝓥 𝓦 𝓧 𝓨 𝓩 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /*  3 */ '𝕒 𝕓 𝕔 𝕕 𝕖 𝕗 𝕘 𝕙 𝕚 𝕛 𝕜 𝕝 𝕞 𝕟 𝕠 𝕡 𝕢 𝕣 𝕤 𝕥 𝕦 𝕧 𝕨 𝕩 𝕪 𝕫 𝔸 𝔹 ℂ 𝔻 𝔼 𝔽 𝔾 ℍ 𝕀 𝕁 𝕂 𝕃 𝕄 ℕ 𝕆 ℙ ℚ ℝ 𝕊 𝕋 𝕌 𝕍 𝕎 𝕏 𝕐 ℤ 𝟘 𝟙 𝟚 𝟛 𝟜 𝟝 𝟞 𝟟 𝟠 𝟡'.split(' '),
    /*  4 */ '𝒶 𝒷 𝒸 𝒹 𝑒 𝒻 𝑔 𝒽 𝒾 𝒿 𝓀 𝓁 𝓂 𝓃 𝑜 𝓅 𝓆 𝓇 𝓈 𝓉 𝓊 𝓋 𝓌 𝓍 𝓎 𝓏 𝒜 𝐵 𝒞 𝒟 𝐸 𝐹 𝒢 𝐻 𝐼 𝒥 𝒦 𝐿 𝑀 𝒩 𝒪 𝒫 𝒬 𝑅 𝒮 𝒯 𝒰 𝒱 𝒲 𝒳 𝒴 𝒵 𝟢 𝟣 𝟤 𝟥 𝟦 𝟧 𝟨 𝟩 𝟪 𝟫'.split(' '),
    /*  5 */ '𝔞 в ᑕ Ｄ Ẹ ᖴ ⓖ 𝓗 Ɨ 𝒿 𝓴 𝓛 𝓂 ⓝ ㄖ Ƥ q я ⓢ t ᑌ 𝐯 ᗯ 𝕩 𝐲 𝓩 𝔞 𝕓 ℂ Đ ᵉ Ｆ 𝔤 н Ｉ ן 𝓴 Ⓛ 𝓜 𝐧 𝐨 Ⓟ 𝔮 ｒ ⓢ Ť Ｕ 𝐯 𝔀 Ｘ ʸ 𝐙 ０ ➀ ➁ ❸ ❹ ➄ ❻ ❼ ➇ ❾'.split(' '),
    /*  6 */ 'ａ ｂ ｃ ｄ ｅ ｆ ｇ ｈ ｉ ｊ ｋ ｌ ｍ ｎ ｏ ｐ ｑ ｒ ｓ ｔ ｕ ｖ ｗ ｘ ｙ ｚ Ａ Ｂ Ｃ Ｄ Ｅ Ｆ Ｇ Ｈ Ｉ Ｊ Ｋ Ｌ Ｍ Ｎ Ｏ Ｐ Ｑ Ｒ Ｓ Ｔ Ｕ Ｖ Ｗ Ｘ Ｙ Ｚ ０ １ ２ ３ ４ ５ ６ ７ ８ ９'.split(' '),
    /*  7 */ '🅰 🅱 🅲 🅳 🅴 🅵 🅶 🅷 🅸 🅹 🅺 🅻 🅼 🅽 🅾 🅿 🆀 🆁 🆂 🆃 🆄 🆅 🆆 🆇 🆈 🆉 🅰 🅱 🅲 🅳 🅴 🅵 🅶 🅷 🅸 🅹 🅺 🅻 🅼 🅽 🅾 🅿 🆀 🆁 🆂 🆃 🆄 🆅 🆆 🆇 🆈 🆉 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /*  8 */ 'ₐ b c d ₑ f g ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ q ᵣ ₛ ₜ ᵤ ᵥ w ₓ y z ₐ B C D ₑ F G ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ Q ᵣ ₛ ₜ ᵤ ᵥ W ₓ Y Z ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉'.split(' '),
    /*  9 */ 'ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ⁱ ʲ ᵏ ˡ ᵐ ⁿ ᵒ ᵖ q ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ ᴬ ᴮ ᶜ ᴰ ᴱ ᶠ ᴳ ᴴ ᴵ ᴶ ᴷ ᴸ ᴹ ᴺ ᴼ ᴾ Q ᴿ ˢ ᵀ ᵁ ⱽ ᵂ ˣ ʸ ᶻ ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹'.split(' '),
    /* 10 */ 'ⓐ ⓑ ⓒ ⓓ ⓔ ⓕ ⓖ ⓗ ⓘ ⓙ ⓚ ⓛ ⓜ ⓝ ⓞ ⓟ ⓠ ⓡ ⓢ ⓣ ⓤ ⓥ ⓦ ⓧ ⓨ ⓩ Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ Ⓘ Ⓙ Ⓚ Ⓛ Ⓜ Ⓝ Ⓞ Ⓟ Ⓠ Ⓡ Ⓢ Ⓣ Ⓤ Ⓥ Ⓦ Ⓧ Ⓨ Ⓩ ⓪ ① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨'.split(' '),
    /* 11 */ 'ค ๖ ¢ ໓ ē f ງ h i ว k l ๓ ຖ ໐ p ๑ r Ş t น ง ຟ x ฯ ຊ ค ๖ ¢ ໓ ē f ງ h i ว k l ๓ ຖ ໐ p ๑ r Ş t น ง ຟ x ฯ ຊ 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /* 12 */ '𝐚 𝐛 𝐜 𝐝 𝐞 𝐟 𝐠 𝐡 𝐢 𝐣 𝐤 𝐥 𝐦 𝐧 𝐨 𝐩 𝐪 𝐫 𝐬 𝐭 𝐮 𝐯 𝐰 𝐱 𝐲 𝐳 𝐀 𝐁 𝐂 𝐃 𝐄 𝐅 𝐆 𝐇 𝐈 𝐉 𝐊 𝐋 𝐌 𝐍 𝐎 𝐏 𝐐 𝐑 𝐒 𝐓 𝐔 𝐕 𝐖 𝐗 𝐘 𝐙 𝟎 𝟏 𝟐 𝟑 𝟒 𝟓 𝟔 𝟕 𝟖 𝟗'.split(' '),
    /* 13 */ '𝗮 𝗯 𝗰 𝗱 𝗲 𝗳 𝗴 𝗵 𝗶 𝗷 𝗸 𝗹 𝗺 𝗻 𝗼 𝗽 𝗾 𝗿 𝘀 𝘁 𝘂 𝘃 𝘄 𝘅 𝘆 𝘇 𝗔 𝗕 𝗖 𝗗 𝗘 𝗙 𝗚 𝗛 𝗜 𝗝 𝗞 𝗟 𝗠 𝗡 𝗢 𝗣 𝗤 𝗥 𝗦 𝗧 𝗨 𝗩 𝗪 𝗫 𝗬 𝗭 𝟬 𝟭 𝟮 𝟯 𝟰 𝟱 𝟲 𝟳 𝟴 𝟵'.split(' '),
    /* 14 */ '𝘢 𝘣 𝘤 𝘥 𝘦 𝘧 𝘨 𝘩 𝘪 𝘫 𝘬 𝘭 𝘮 𝘯 𝘰 𝘱 𝘲 𝘳 𝘴 𝘵 𝘶 𝘷 𝘸 𝘹 𝘺 𝘻 𝘈 𝘉 𝘊 𝘋 𝘌 𝘍 𝘎 𝘏 𝘐 𝘑 𝘒 𝘓 𝘔 𝘕 𝘖 𝘗 𝘘 𝘙 𝘚 𝘛 𝘜 𝘝 𝘞 𝘟 𝘠 𝘡 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /* 15 */ '𝙖 𝙗 𝙘 𝙙 𝙚 𝙛 𝙜 𝙝 𝙞 𝙟 𝙠 𝙡 𝙢 𝙣 𝙤 𝙥 𝙦 𝙧 𝙨 𝙩 𝙪 𝙫 𝙬 𝙭 𝙮 𝙯 𝘼 𝘽 𝘾 𝘿 𝙀 𝙁 𝙂 𝙃 𝙄 𝙅 𝙆 𝙇 𝙈 𝙉 𝙊 𝙋 𝙌 𝙍 𝙎 𝙏 𝙐 𝙑 𝙒 𝙓 𝙔 𝙕 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /* 16 */ '𝚊 𝚋 𝚌 𝚍 𝚎 𝚏 𝚐 𝚑 𝚒 𝚓 𝚔 𝚕 𝚖 𝚗 𝚘 𝚙 𝚚 𝚛 𝚜 𝚝 𝚞 𝚟 𝚠 𝚡 𝚢 𝚣 𝙰 𝙱 𝙲 𝙳 𝙴 𝙵 𝙶 𝙷 𝙸 𝙹 𝙺 𝙻 𝙼 𝙽 𝙾 𝙿 𝚀 𝚁 𝚂 𝚃 𝚄 𝚅 𝚆 𝚇 𝚈 𝚉 𝟶 𝟷 𝟸 𝟹 𝟺 𝟻 𝟼 𝟽 𝟾 𝟿'.split(' '),
    /* 17 */ '卂 乃 匚 ᗪ 乇 千 Ꮆ 卄 丨 ﾌ Ҝ ㄥ 爪 几 ㄖ 卩 Ɋ 尺 丂 ㄒ ㄩ ᐯ 山 乂 ㄚ 乙 卂 乃 匚 ᗪ 乇 千 Ꮆ 卄 丨 ﾌ Ҝ ㄥ 爪 几 ㄖ 卩 Ɋ 尺 丂 ㄒ ㄩ ᐯ 山 乂 ㄚ 乙 0 1 2 3 4 5 6 7 8 9'.split(' '),
    /* 18 */ 'ᗩ ᗷ ᑕ ᗪ E ᖴ G ᕼ I ᒍ K ᒪ ᗰ ᑎ O ᑭ ᑫ ᖇ ᔕ T ᑌ ᐯ ᗯ ᙭ Y ᘔ ᗩ ᗷ ᑕ ᗪ E ᖴ G ᕼ I ᒍ K ᒪ ᗰ ᑎ O ᑭ ᑫ ᖇ ᔕ T ᑌ ᐯ ᗯ ᙭ Y ᘔ 0 1 2 3 4 5 6 7 8 9'.split(' ')
  ]
  if (font === undefined)
    font = Math.floor(Math.random() * fonts.length)

  console.log(text, text.split('').map(char => base.indexOf(char)), text.split('').map(char => base.indexOf(char)).map(index => (index === -1) ? text[index] : fonts[font][index]).join(''))

  return text
    .split('')
    .map(char => base.indexOf(char))
    .map(index => (index === -1) ? text[index] : fonts[font][index])
    .join('')
}
