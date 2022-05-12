/* eslint-disable no-labels */
import { ButtonStyle, ComponentType, MessageComponent, ReplyableCommandInteraction } from 'cordo'
import Emojis from '../../lib/emojis'


function inRange(from: number, to: number) {
  return from + ~~(Math.random() * (to - from))
}

const tests = [
  quickTest,
  pineappleTest,
  greenTest,
  patienceTest,
  actualTest,
  selfReflectionTest,
  mathTest
]

export default function (i: ReplyableCommandInteraction) {
  tests[~~(Math.random() * tests.length)](i)
}

function quickTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Question One:',
      description: 'What does IQ stand for? You have 10 seconds to answer.',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'smart',
          label: 'Intelligence quotient'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_1',
          label: 'Intelligence quota'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_2',
          label: 'Interplanetary quadrant'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_3',
          label: 'Inhuman quadragesimal'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_4',
          label: 'Ichthyological quackishnesses'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_5',
          label: 'Iatrogenicities quadricentenary'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_6',
          label: 'Insane quacking'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_7',
          label: 'Inside Qatar'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_8',
          label: 'Intercourse Quotient'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_9',
          label: 'Intellergence Qotent'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_10',
          label: 'Instant Quoting'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_11',
          label: 'Intense Queue'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'stupid_12',
          label: 'Innocent Questions'
        }
      ].sort(() => Math.random() - 0.5) as MessageComponent[]
    })
    .withTimeout(10e3, j => j.edit({
      title: 'Time is up!',
      description: `Since you did not answer in time your IQ cannot be that high... Let's give you a score of like, idk, ${inRange(70, 80)}`,
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('smart', h => h.edit({
      title: 'Test passed!',
      description: 'You are officially smart 🤝',
      components: []
    }))
    .on('stupid_$nr', h => h.edit({
      title: 'You are stupid!',
      description: `Your IQ is like below ${inRange(80, 90)}, probably only ${inRange(70, 79)}... but who am I to judge, dummy`,
      components: []
    }))
}

function pineappleTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'You found a pineapple 🍍',
      description: 'Where do you put it?',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'pizza',
          emoji: { name: '🍕' }
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'trash',
          emoji: { name: '🗑️' }
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'ocean',
          emoji: { name: '🌊' }
        }
      ]
    })
    .withTimeout(60e3, j => j.edit({
      title: 'You stood there for 3 hours without moving the pineapple an inch',
      description: `That was not very smart, your IQ is ${inRange(70, 100)}`,
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('ocean', h => h.edit({
      title: 'You threw the pineapple in the ocean',
      description: `You are the definition of stupidity. You don't throw trash in the ocean! Only ${inRange(40, 60)} IQ points for you.`,
      components: []
    }))
    .on('pizza', h => h.edit({
      title: 'You put the pineapple on a pizza',
      description: 'Oh. My. God. Pineapple on the pizza? Are you stupid or insane? Probably both huh?\n\n*Pineapple on pizza, smh...     some people*',
      components: []
    }))
    .on('trash', h => h.edit({
      title: 'You put the pineapple in the trash can',
      description: `Your IQ is ${inRange(130, 140)}!\n\nNO ITS NOT DUMBASS, YOU DON'T THROW FOOD AWAY. WHO DO YOU THINK YOU ARE? MR SMART? FOR SURE NOT, ${inRange(40, 60)} IQ POINTS MAXIMUM FOR YOU, DUMBASS!`,
      components: []
    }))
}

function greenTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Pick green',
      description: 'Go, pick green. You have 10 seconds!',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'green_1',
          emoji: { name: '🟢' }
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          custom_id: 'blue',
          label: 'Blue'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'green_2',
          label: 'Green'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          custom_id: 'green_3',
          emoji: { id: Emojis.bigSpace.id }
        }
      ]
    })
    .withTimeout(60e3, j => j.edit({
      title: 'Can\'t decide?',
      description: 'Yeah yeah it is a difficult task, just try it again when you\'re ready!',
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('green_$nr', h => h.edit({
      title: 'Good job!',
      description: `Your IQ is ${inRange(100, 120)}`,
      components: []
    }))
    .on('blue', h => h.edit({
      title: 'Ahhh close one!',
      description: `That was blue! Better luck next time, your IQ is ${inRange(90, 100)}`,
      components: []
    }))
}

function patienceTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Patience test',
      description: 'Your task: Resist clicking any of the buttons below for 30 seconds.',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          custom_id: 'news',
          label: 'Man made 2k in 15 minu...',
          emoji: { name: '📰' }
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.DANGER,
          custom_id: 'moms',
          label: 'FIND HOT SINGLE MOMS',
          emoji: { name: '❗' }
        },
        {
          type: ComponentType.LINE_BREAK
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'update',
          label: 'Windows update pending...'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.PRIMARY,
          custom_id: 'lifehacks',
          label: 'Top 10 Lifehacks 2021',
          emoji: { name: '▶️' }
        },
        {
          type: ComponentType.LINE_BREAK
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SUCCESS,
          custom_id: 'game',
          label: 'DOWNLOAD FREE ONLINE GAME',
          emoji: { name: '📥' }
        }
      ]
    })
    .withTimeout(30e3, j => j.edit({
      title: 'Great job!',
      description: `You are clearly very gifted. Your IQ is as high as ${inRange(120, 140)}!`,
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('update', h => h.edit({
      title: 'You installed a windows update!',
      description: `Now your PC stopped working. Not the smartest idea right? Your IQ is ${inRange(80, 110)}`,
      components: []
    }))
    .on('lifehacks', h => h.edit({
      title: 'Top 10 Lifehacks 2021',
      description: 'Must watch Lifehacks 2021 top lifehacks new tips and tricks exciting outdoors secret watchmojo subscribe to our youtube channel link below top 10 click here',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.LINK,
          url: 'https://www.youtube.com/results?search_query=Top+10+Lifehacks+2021',
          label: 'Click here to watch'
        }
      ]
    }))
    .on('game', h => h.edit({
      title: 'You download the free browser game',
      description: 'WAIT why do you need to download a browser game??!? :flushed:\nYou caught yourself a computer virus. Get that sorted first before you get your IQ score...',
      components: []
    }))
    .on('news', h => h.edit({
      title: 'You read the news',
      description: `You are clearly educated. ${inRange(110, 130)} IQ points :+1:`,
      components: []
    }))
    .on('moms', h => h.edit({
      title: 'You go looking for hot single moms in your area',
      description: 'Let me know when you found some!',
      components: []
    }))
}

function actualTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Task one',
      description: 'Complete the following pattern:\n\n`↑.` `→:` `↓ ` `←.` `↑:` `→ `',
      components: [ '↑ ', '↑.', '↑:', '→ ', '→.', '→:', '↓ ', '↓.', '↓:', '← ', '←.', '←:' ]
        .sort(() => Math.random() - 0.5)
        .map((label, i) => ({
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: label === '↓.' ? 'correct' : `incorrect_${i}`,
          label
        }))
    })
    .withTimeout(60e3, j => j.edit({
      title: 'You took to long!',
      description: `That's something dumb people do. Your IQ is around ${inRange(80, 90)} - ${inRange(95, 100)}!`,
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('correct', h => h.edit({
      title: 'Good job!',
      description: `You did so well we only need this one question to calculate your IQ. You scored ${inRange(140, 180)} Points! Congratulations!`,
      components: []
    }))
    .on('incorrect_$nr', h => h.edit({
      title: 'Mhm',
      description: `Yeah nope, that's not the one. I think we better stop here before you embarrass yourself even more. Your IQ is ${inRange(90, 120)}.`,
      components: []
    }))
}

function selfReflectionTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Self relection',
      description: 'What do you think your IQ is?',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'very_low',
          label: 'below 70'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'low',
          label: '70-90'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'normal',
          label: '90-110'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'high',
          label: '110-130'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'very_high',
          label: 'over 130'
        }
      ]
    })
    .withTimeout(60e3, j => j.edit({
      title: 'Not even sure where to put yourself?',
      description: `That's kinda cringe. And also not very smart. Your score: ${inRange(80, 90)}`,
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('very_low', h => h.edit({
      title: 'Well if you say so...',
      description: 'Your IQ is below 70!',
      components: []
    }))
    .on('low', h => h.edit({
      title: 'You might not be smart but at least you are honest',
      description: `You picked correctly! Your IQ is ${inRange(70, 90)}. Good job.`,
      components: []
    }))
    .on('normal', h => h.edit({
      title: 'The golden middle huh?',
      description: `Thats something smart people would pick.\n\nJust kidding you are not smart, your IQ is ${inRange(70, 90)}`,
      components: []
    }))
    .on('high', h => h.edit({
      title: 'Aha',
      description: `You must be very confident about your intelligence. You know what I'm confident about? That dumb people like to think they're smarter than they actually are. You are not an exception. ${inRange(80, 100)} Points.`,
      components: []
    }))
    .on('very_high', h => h.edit({
      title: 'Pfff yeah',
      description: 'Think you\'re better than everyone else? Think you\'re smarter, quicker, cleverer? You are the kind of person to point out typos in youtube comments. The kind of person who only survived middle school because you\'re not allowed to hit kids with glasses. The kind of person nobody likes because they\'re very arrogant, selfish. Yeah, does that sound like you? Yes? Good because you\'re not as smart as you think, you make just as many mistakes as everyone else. Taking this IQ test was one of them. Now go outside, don\'t sit in front of your computer all day!',
      components: []
    }))
}

function mathTest(i: ReplyableCommandInteraction) {
  i
    .replyInteractive({
      title: 'Math test',
      description: '**2 + 2 x 4**',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'yes_1',
          label: '16'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'yes_2',
          label: '15'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'yes_3',
          label: '14'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'yes_4',
          label: '13'
        }
      ]
    })
    .withTimeout(60e3, j => j.edit({
      title: 'uhhhhhumm',
      description: 'https://pbs.twimg.com/media/D0Qb0pAW0AEUQiK.jpg',
      components: []
    }), { onInteraction: 'removeTimeout' })
    .on('yes_$nr', h => h.edit({
      title: 'I am not sure whats the right answer',
      description: `But you look smart, I'll give you an IQ score of ${inRange(120, 135)}`,
      components: []
    }))
}
