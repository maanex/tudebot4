/* eslint-disable require-await */
import { Message, TextChannel } from 'discord.js'
import { ReplyFunction } from 'types/types'
import { ExpandedItem, ItemPrefab } from '../../thirdparty/tudeapi/item'
import TudeApi, { ClubUser } from '../../thirdparty/tudeapi/tudeapi'
import { TudeBot } from '../../index'
import CommandsModule from '../../modules/commands'


export default class Letter extends ExpandedItem {

  constructor(prefab: ItemPrefab, id: string, title?: string, text?: string, author?: string) {
    super(prefab, id, {
      title,
      text,
      author
    })
  }

  async renderMetadata() {
    return this.written
      ? [ {
          name: 'Author',
          value: (await this.getAuthor()).user.name
        },
        {
          name: 'Text',
          value: this.text
        } ]
      : [ {
          name: 'Empty',
          value: `Write on this letter using \`use ${this.id}\``
        } ]
  }

  async use(mes: Message, repl: ReplyFunction, u: ClubUser) {
    if (this.written) {
      repl(this.title, 'message', this.text, { footer: `Written by ${(await this.getAuthor()).user.name}` })
    } else {
      const cmdMod = TudeBot.getModule<CommandsModule>('commands')
      repl('Wanna write something on this letter?', 'message', 'Sure, go ahead. Just type the text in the chat. Write `cancel` if you change your mind!')
      cmdMod.awaitUserResponse(mes.author, mes.channel as TextChannel, 10 * 60 * 1000, (reply: Message) => {
        if (!reply) return
        if (reply.content.toLowerCase() === 'cancel') {
          repl('No text, okay :(')
          return
        }
        const text = reply.content

        repl('Fabulous!', 'message', 'Now I just need a title for this masterpiece.')
        cmdMod.awaitUserResponse(mes.author, mes.channel as TextChannel, 10 * 60 * 1000, (reply2: Message) => {
          if (!reply) return
          if (reply.content.toLowerCase() === 'cancel') {
            repl('Aight, see you later!')
            return
          }

          const title = reply2.content

          this.author = u.id
          this.title = title
          this.text = text
          TudeApi.updateClubUser(u)
          repl('Wonderfull!', 'message', 'Your letter is written!')
        })
      })
    }
  }

  //

  public get written(): boolean {
    return !!this.author
  }

  public get author(): string {
    return this.meta.author
  }

  public set author(id: string) {
    this.meta.author = id
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.author = id
  }

  public async getAuthor(): Promise<ClubUser> {
    return TudeApi.clubUserById(this.author)
  }

  public get text(): string {
    return this.meta.text
  }

  public set text(text: string) {
    this.meta.text = text
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.text = text
  }

  public get title(): string {
    return this.meta.title
  }

  public set title(title: string) {
    this.meta.title = title
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.title = title
  }

  public get name(): string {
    return this.title || 'Blank Letter'
  }

}
