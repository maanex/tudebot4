import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, ReplyableCommandInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { Guild, TextChannel } from 'discord.js'
import { TudeBot } from '../..'
import Database from '../../database/database'
import CommandsModule from '../../modules/commands'
import QuickRepliesModule, { Reply } from '../../modules/quickreplies'


const ITEMS_PER_PAGE = 5

export default async function (i: ReplyableCommandInteraction) {
  try {
    if (!i.member || !PermissionStrings.containsManageServer(i.member.permissions))
      return i.replyPrivately({ title: 'No, this command is not for you!' })

    const quickRepliesModule = TudeBot.getModule<QuickRepliesModule>('quickreplies')
    const commandsModule = TudeBot.getModule<CommandsModule>('commands')
    let replies = (await quickRepliesModule.getReplies(i.guild_id)) || []

    const guild = await TudeBot.guilds.fetch(i.guild_id)
    const user = await TudeBot.users.fetch(i.user.id)
    const channel = await TudeBot.channels.fetch(i.channel_id) as TextChannel

    let pageCount = Math.ceil(replies.length / ITEMS_PER_PAGE) || 1
    let pageIndex = 1
    const repliesSubset = () => replies.slice((pageIndex - 1) * ITEMS_PER_PAGE, pageIndex * ITEMS_PER_PAGE)

    let currentlyEditing: Reply = null

    i
      .replyInteractive(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
      .withTimeout(
        5 * 60 * 1000,
        j => j.disableComponents(),
        { onInteraction: 'restartTimeout' }
      )
      .on('page_minus', h => h.edit(generateListWidget(guild, --pageIndex, pageCount, repliesSubset())))
      .on('page_plus', h => h.edit(generateListWidget(guild, ++pageIndex, pageCount, repliesSubset())))
      .on('cancel', h => h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset())))
      .on('new', (h) => {
        h.edit({
          title: 'Enter trigger',
          description: 'You can add multiple triggers by seperating them using a comma.\nDo not prefix the trigger with -\nYou have 2 minutes to answer or else :gun:\nType `cancel` to cancel',
          components: []
        })
        commandsModule.awaitUserResponse(user, channel, 2 * 60 * 1000, (res1) => {
          if (!res1 || res1.content.toLowerCase() === 'cancel') {
            h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
            return
          }

          h.edit({
            title: 'Enter Response',
            description: 'Please now enter your desired response.\nType `cancel` to cancel',
            components: []
          })
          commandsModule.awaitUserResponse(user, channel, 2 * 60 * 1000, async (res2) => {
            if (!res2 || res2.content.toLowerCase() === 'cancel') {
              h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
              return
            }

            h.edit({
              title: 'New Response added!',
              components: []
            })

            const trigger = res1.content.split(',').map(e => e.trim().toLowerCase())
            const response = res2.content
            const obj = { trigger, response }

            const data = await Database.collection('quickreplies').findOne({ _id: i.guild_id })
            if (data) {
              data.list.push(obj)
              await Database.collection('quickreplies').updateOne(
                { _id: i.guild_id },
                { $set: { list: data.list } }
              )
            } else {
              await Database.collection('quickreplies').insertOne({
                _id: i.guild_id,
                list: [ obj ]
              })
            }
            replies = [ obj, ...replies ]

            setTimeout(() => {
              pageCount = Math.ceil(replies.length / ITEMS_PER_PAGE) || 1
              pageIndex = 1
              h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
            }, 3000)
          })
        })
      })
      .on('edit', (h) => {
        h.edit({
          title: 'Which reply would you like to edit',
          description: 'Please enter a trigger for this reply now. Thanks.\n`cancel` to cancel',
          components: []
        })
        commandsModule.awaitUserResponse(user, channel, 2 * 60 * 1000, (res1) => {
          if (!res1 || res1.content.toLowerCase() === 'cancel') {
            h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
            return
          }

          const lookup = res1.content.toLowerCase().trim()
          currentlyEditing = replies.find(r => r.trigger.includes(lookup))
          if (currentlyEditing) {
            h.edit(generateEditWidget(currentlyEditing))
            return
          }

          h.edit({
            title: `${lookup} not found`
          })
          setTimeout(() => {
            h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
          }, 2 * 1000)
        })
      })
      .on('edit_triggers', (h) => {
        h.edit({
          title: 'Change triggers',
          description: `These are the current triggers:\n\n${currentlyEditing.trigger.join(', ')}\n\nType your new triggers or \`cancel\` to cancel`,
          components: []
        })

        commandsModule.awaitUserResponse(user, channel, 2 * 60 * 1000, async (res1) => {
          if (!res1 || res1.content.toLowerCase() === 'cancel') {
            h.edit(generateEditWidget(currentlyEditing))
            return
          }

          currentlyEditing.trigger = res1.content.split(',').map(e => e.trim().toLowerCase())
          await Database.collection('quickreplies').updateOne(
            { _id: i.guild_id },
            { $set: { list: replies } }
          )

          h.edit(generateEditWidget(currentlyEditing))
        })
      })
      .on('edit_response', (h) => {
        h.edit({
          title: 'Change response',
          description: `Here is the current response:\n\n${currentlyEditing.response}\n\nType your new response or \`cancel\` to cancel`,
          components: []
        })

        commandsModule.awaitUserResponse(user, channel, 2 * 60 * 1000, async (res1) => {
          if (!res1 || res1.content.toLowerCase() === 'cancel') {
            h.edit(generateEditWidget(currentlyEditing))
            return
          }

          currentlyEditing.response = res1.content
          await Database.collection('quickreplies').updateOne(
            { _id: i.guild_id },
            { $set: { list: replies } }
          )

          h.edit(generateEditWidget(currentlyEditing))
        })
      })
      .on('delete', (h) => {
        h.edit({
          title: `Delete ${currentlyEditing.trigger[0]}?`,
          description: `Type \`${currentlyEditing.trigger[0]}\` to confirm, type \`cancel\` to cancel`,
          components: []
        })

        commandsModule.awaitUserResponse(user, channel, 30 * 1000, async (res1) => {
          if (!res1 || res1.content.toLowerCase() === 'cancel') {
            h.edit(generateEditWidget(currentlyEditing))
            return
          }

          replies.splice(replies.indexOf(currentlyEditing), 1)
          await Database.collection('quickreplies').updateOne(
            { _id: i.guild_id },
            { $set: { list: replies } }
          )

          h.edit({
            title: `${currentlyEditing.trigger[0]} was deleted.`
          })

          setTimeout(() => {
            pageCount = Math.ceil(replies.length / ITEMS_PER_PAGE) || 1
            pageIndex = 1
            h.edit(generateListWidget(guild, pageIndex, pageCount, repliesSubset()))
          }, 3000)
        })
      })
  } catch (err) {
    console.error(err)
    i.replyPrivately({ title: 'oops, error' })
    return false
  }
}

function generateListWidget(guild: Guild, pageIndex: number, pageCount: number, replies: Reply[]): InteractionApplicationCommandCallbackData {
  return {
    embeds: [ {
      title: `Quick replies for ${guild.name}`,
      description: replies.length ? '' : '*Nothing*',
      fields: replies.map(r => ({
        name: r.trigger.join(', ').substr(0, 25),
        value: r.response,
        inline: false
      })),
      footer: { text: `Page ${pageIndex} of ${pageCount}` },
      color: 0x56F0D6
    } ],
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '<',
        custom_id: 'page_minus',
        disabled: pageIndex <= 1
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Edit Reply',
        custom_id: 'edit',
        disabled: !replies.length
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'New Reply',
        custom_id: 'new'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '>',
        custom_id: 'page_plus',
        disabled: pageIndex >= pageCount
      }
    ]
  }
}

function generateEditWidget(reply: Reply): InteractionApplicationCommandCallbackData {
  return {
    title: `Edit ${reply.trigger[0]}`,
    description: `**Triggers:**\n${reply.trigger.join(', ')}\n\n**Response:**\n${reply.response}`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Edit triggers',
        custom_id: 'edit_triggers'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Edit response',
        custom_id: 'edit_response'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Delete',
        custom_id: 'delete'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Done',
        custom_id: 'cancel'
      }
    ]
  }
}
