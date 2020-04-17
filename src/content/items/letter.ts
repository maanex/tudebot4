import { ExpandedItem, ItemPrefab } from "../../thirdparty/tudeapi/item"
import TudeApi, { ClubUser } from "../../thirdparty/tudeapi/tudeapi";
import { Message } from "discord.js";
import { ReplyFunction } from "types";


export default class Letter extends ExpandedItem {
 
  constructor(prefab: ItemPrefab, id: string, title?: string, text?: string, author?: string) {
    super(prefab, id, {
      title: title,
      text: text,
      author: author
    });
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
      repl(this.title, 'message', this.text, { footer: `Written by ${(await this.getAuthor()).user.name}` });
    } else {
      repl('You\'ve written something in this ass book!');
      this.author = u.id;
      this.title = 'Ass '.repeat(Math.floor(Math.random() * 10)),
      this.text = mes.content;
      TudeApi.updateClubUser(u);
    }
  }

  //

  public get written(): boolean {
    return !!this.author;
  }

  public get author(): string {
    return this.meta.author;
  }
  public set author(id: string) {
    this.meta.author = id;
    if (!this.metaChanges) this.metaChanges = {};
    this.metaChanges.author = id;
  }
  public async getAuthor(): Promise<ClubUser> {
    return TudeApi.clubUserById(this.author);
  }

  public get text(): string {
    return this.meta.text;
  }
  public set text(text: string) {
    this.meta.text = text;
    if (!this.metaChanges) this.metaChanges = {};
    this.metaChanges.text = text;
  }

  public get title(): string {
    return this.meta.title;
  }
  public set title(title: string) {
    this.meta.title = title;
    if (!this.metaChanges) this.metaChanges = {};
    this.metaChanges.title = title;
  }

  public get name(): string {
    return this.title || 'Blank Letter';
  }

}
