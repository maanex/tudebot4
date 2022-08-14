import { ReplyableCommandInteraction } from 'cordo'


export default function (i: ReplyableCommandInteraction) {
  if (!i.member) {
    return i.replyPrivately({
      title: 'Nope',
      description: 'Run this in a server dude'
    })
  }

  i.state('gaming_hub')
}

