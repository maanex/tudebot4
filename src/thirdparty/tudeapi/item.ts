import TudeApi from "./tudeapi";

export class ItemCategory {
  
  constructor (
    public readonly id: string,
  ) { }

  public get name(): string { return TudeApi.clubLang['itemcat_'+this.id]; }
  public get namepl(): string { return TudeApi.clubLang['itemcatpl_'+this.id]; }
  public getName(amount: number): string { return amount == 1 ? this.name : this.namepl; }

  //

  public static SYSTEM = new ItemCategory('system');
  public static FISHING = new ItemCategory('fishing');
  public static COLLECTABLE = new ItemCategory('collectable');

}

export class ItemGroup {

  constructor (
    public readonly id: string,
  ) { }

  public get name(): string { return TudeApi.clubLang['itemgroup_'+this.id]; }
  public get namepl(): string { return TudeApi.clubLang['itemgrouppl_'+this.id]; }
  public getName(amount: number): string { return amount == 1 ? this.name : this.namepl; }

  //

  public static CURRENCY = new ItemGroup('currency');
  public static LOOTBOX = new ItemGroup('lootbox');
  public static COLLECTABLE = new ItemGroup('collectable');
  public static GAME_ASSET = new ItemGroup('gameasset');

}

export abstract class Item {

  constructor (
    public readonly id: string,
    public readonly type: string,
    public readonly amount: number,
    public readonly category: ItemCategory,
    public readonly group: ItemGroup,
    public readonly expanded: boolean,
    public readonly tradeable: boolean,
    public readonly sellable: boolean,
    public readonly purchaseable: boolean,
    public readonly icon: string,
    protected readonly meta: any = undefined,
    public readonly _isDef: boolean = false,
  ) { };

  public get name(): string {
    return TudeApi.clubLang[(this.amount==1?'item_':'itempl_')+this.id];
  }

}

export abstract class StackableItem extends Item {

  constructor (
    type: string,
    amount: number,
    category: ItemCategory,
    group: ItemGroup,
    tradeable: boolean,
    sellable: boolean,
    purchaseable: boolean,
    icon: string,
    _isDef: boolean = false,
  ) {
    super (
      type,
      type,
      amount,
      category,
      group,
      false,
      tradeable,
      sellable,
      purchaseable,
      icon,
      undefined,
      _isDef
    )
  };

  public set amount(amount) {
    this['amount'] = amount;
  }

}

export abstract class ExpandedItem extends Item {

  constructor (
    id: string,
    type: string,
    category: ItemCategory,
    group: ItemGroup,
    tradeable: boolean,
    sellable: boolean,
    purchaseable: boolean,
    icon: string,
    meta: any = {},
    _isDef: boolean = false,
  ) {
    super (
      id,
      type,
      1,
      category,
      group,
      true,
      tradeable,
      sellable,
      purchaseable,
      icon,
      meta,
      _isDef
    )
  };

}