import { ItemList, Items } from "./itemlist";
import { Item, ItemPrefab } from "thirdparty/tudeapi/item";
import { ProfileEmblemSet } from "int/emojis";

export class ProfileSkin {

  public static readonly DEFAULT = new ProfileSkin(null);
  public static readonly BLUE = new ProfileSkin(Items.ProfileSkinBlue, { emblemSet: 'MONOCHROME' });

  //

  private _item: ItemPrefab;
  private _id: string;

  public readonly emblemSet: ProfileEmblemSet;

  public constructor(item: ItemPrefab, settings?: {
    emblemSet?: ProfileEmblemSet
  }) {
    this._item = item;
    this._id = item?.id ?? '';

    this.emblemSet = settings?.emblemSet || 'DEFAULT';
  }

  //

  public get item(): ItemPrefab { return this._item; }
  public get id(): string { return this._id; }

}