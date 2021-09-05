/* eslint-disable no-labels */
import { ReplyableCommandInteraction } from 'cordo'
import { TudeBot } from '../..'
import Emojis from '../../int/emojis'


export default async function (i: ReplyableCommandInteraction) {
  let name1: string = (i.data.option.name1 || i.user.username) + ''
  let name2: string = (i.data.option.name2 || 'tudebot') + ''

  if (/^<@\d+*>$/.test(name1)) {
    try {
      const person = (await (await TudeBot.guilds.fetch(i.guild_id)).members.fetch(name1.match(/\d+/)[0]))
      name1 = person.nickname || person.user.username
    } catch (_) {}
  }
  if (/^<@\d+*>$/.test(name2)) {
    try {
      const person = (await (await TudeBot.guilds.fetch(i.guild_id)).members.fetch(name2.match(/\d+/)[0]))
      name2 = person.nickname || person.user.username
    } catch (_) {}
  }

  name1 = name1.toLowerCase()
  name2 = name2.toLowerCase()

  if (name1 === name2) {
    i.reply({
      embeds: [ {
        title: 'Approve',
        image: { url: 'https://cdn.discordapp.com/attachments/655354019631333397/682339526802538559/unknown.png' }
      } ]
    })
    return false
  }

  if (name1.length > name2.length)
    [ name1, name2 ] = [ name2, name1 ]

  let match = ''
  out:
  for (let checklength = name1.length; checklength > 0; checklength--) {
    for (let index = 0; index <= (name1.length - checklength); index++) {
      const check = name1.substr(index, checklength)
      if (name2.includes(check)) {
        match = check
        break out
      }
    }
  }

  let shipName = ''
  let chances = 0

  if (match) {
    const option1 = name1.split(match)[0] + match + name2.split(match)[1]
    const option2 = name2.split(match)[0] + match + name1.split(match)[1]
    const option1poor = option1.startsWith(match) || option1.endsWith(match)
    const option2poor = option2.startsWith(match) || option2.endsWith(match)
    if (option1poor && !option2poor) { shipName = option2 } else if (option2poor && !option1poor) { shipName = option1 } else if (option1poor && option2poor) { shipName = option1 } else {
      const optimumLength = (name1.length + name2.length) / 2
      const option1delta = Math.abs(option1.length - optimumLength)
      const option2delta = Math.abs(option2.length - optimumLength)
      if (option1delta < option2delta) shipName = option1
      else shipName = option2
    }

    let same = 0
    let one = 0
    for (const letter of ('abcdefghijklmnoqrstuvwxyz').split('')) {
      if (name1.includes(letter)) {
        if (name2.includes(letter)) same++
        one++
      } else if (name2.includes(letter)) { one++ }
    }

    chances = (one - same) / name2.length
    chances = Math.abs(Math.round(chances * 100))
    while (chances > 100) chances -= 100
  }

  let heart = ''
  if (chances === 100) heart = '💖'
  else if (chances === 0) heart = '🖤'
  else if (chances >= 50) heart = '❤️'
  else heart = '💔'

  const title = `${capitalize(name1)} ${heart} ${capitalize(name2)}`
  const description = shipName
    ? `👉 __${capitalize(shipName)}__ ${Emojis.bigSpace.string} ${chances}%`
    : 'Really really bad connection between these two!'

  i.reply({ title, description })
  return true
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
}
