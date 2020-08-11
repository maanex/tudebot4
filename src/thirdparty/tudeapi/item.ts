import TudeApi, { ClubUser } from "./tudeapi";
import { MessageEmbedField, Message } from "discord.js";
import { ReplyFunction } from "types/types";

export class ItemCategory {
  
  constructor (
    public readonly id: string,
  ) { }

  public get name(): string { return TudeApi.clubLang['itemcat_'+this.id]; }
  public get namepl(): string { return TudeApi.clubLang['itemcatpl_'+this.id]; }
  public getName(amount: number): string { return amount == 1 ? this.name : this.namepl; }

  //

  public static UNDEFINED = new ItemCategory('undefined');
  public static SYSTEM = new ItemCategory('system');
  public static FISHING_EQUIPMENT = new ItemCategory('fishing_assets');
  public static COLLECTABLE = new ItemCategory('collectable');
  public static PROFILE_SKIN = new ItemCategory('profile_skin');

}

export class ItemGroup {

  constructor (
    public readonly id: string,
  ) { }

  public get name(): string { return TudeApi.clubLang['itemgroup_'+this.id]; }
  public get namepl(): string { return TudeApi.clubLang['itemgrouppl_'+this.id]; }
  public getName(amount: number): string { return amount == 1 ? this.name : this.namepl; }

  //

  public static UNDEFINED = new ItemGroup('undefined');
  public static CURRENCY = new ItemGroup('currency');
  public static LOOTBOX = new ItemGroup('lootbox');
  public static COLLECTABLE = new ItemGroup('collectable');
  public static GAME_ASSET = new ItemGroup('game_asset');

}

export interface ItemPrefab {
  id: string;
  selectionAliases?: string[];
  category: ItemCategory;
  group: ItemGroup;
  expanded: boolean;
  tradeable: boolean;
  sellable: boolean;
  purchaseable: boolean;
  useable: boolean;
  icon: string;
  class: any;
  create: any;
  parse?: any;
  useText?: string;
  _isDef?: boolean;
}

export abstract class Item {

  public metaChanges: any = undefined;

  constructor (
    public readonly prefab: ItemPrefab,
    public id: string,
    protected _amount: number,
    protected _meta: any = undefined,
  ) { };
  
  public set amount(amount) { this._amount = amount; }
  public get amount() { return this._amount; }
  
  public set meta(meta) { this._meta = meta; this.metaChanges = meta; }
  public get meta() { return this._meta; }

  public get name(): string {
    return TudeApi.clubLang[(this.amount==1?'item_':'itempl_')+this.prefab.id];
  }

  public get description(): string {
    return TudeApi.clubLang['itemdesc_'+this.prefab.id];
  }

  public abstract renderMetadata(): Promise<MessageEmbedField[]>;

  public use(message: Message, repl: ReplyFunction, executor: ClubUser) {
    if (this.prefab.useText) repl(this.prefab.useText);
    else repl('Okay this is weird', 'bad', 'See, someone told me this item is something you can use but like... idk how to use it. Hmmm.');
  }

}

export abstract class StackableItem extends Item {

  constructor(prefab: ItemPrefab, amount: number) {
    super(prefab, prefab.id, amount, undefined);
  };

  public set meta(meta) {
    console.trace(`Attempted to change meta on a non-extended item. ${this.prefab.id}`);
  }
  public get meta() { return undefined }

  async renderMetadata() { return []; }

}

export abstract class ExpandedItem extends Item {

  constructor(prefab: ItemPrefab, id: string, meta: any) {
    super(prefab, id, 1, meta);
  };

  public set amount(amount) {
    if (amount == 0) this._amount = 0;
    else this._amount = 1;
  }
  public get amount() { return this._amount; }

  async renderMetadata() { return []; }

}
