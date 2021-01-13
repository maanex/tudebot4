import { ItemCategory, ItemGroup, StackableItem, ItemPrefab, ExpandedItem } from '../thirdparty/tudeapi/item'
import Emojis from '../int/emojis'
import TudeApi, { ClubUser } from '../thirdparty/tudeapi/tudeapi'
import Letter from './items/letter'
import GenericFish from './items/generic-fish'

export const defaultItemIcon = '❔'

//

export const Items = {
  Test: {
    id: 'test',
    category: ItemCategory.UNDEFINED,
    group: ItemGroup.UNDEFINED,
    expanded: true,
    tradeable: false,
    sellable: false,
    purchaseable: false,
    useable: false,
    icon: defaultItemIcon,
    Class: class Test extends ExpandedItem { },
    create: (id: string, meta: any) => new Items.Test.Class(Items.Test, id, meta)
  },
  Cookie: {
    id: 'cookie',
    selectionAliases: [ 'cookies' ],
    category: ItemCategory.SYSTEM,
    group: ItemGroup.CURRENCY,
    expanded: false,
    tradeable: true,
    sellable: false,
    purchaseable: false,
    useable: true,
    useText: 'Yo, head over to the shop to spend your cookies!',
    icon: Emojis.COOKIES,
    Class: class Cookie extends StackableItem { },
    create: (amount: number) => new Items.Cookie.Class(Items.Cookie, amount),
    _isDef: true
  },
  Gem: {
    id: 'gem',
    selectionAliases: [ 'gems' ],
    category: ItemCategory.SYSTEM,
    group: ItemGroup.CURRENCY,
    expanded: false,
    tradeable: false,
    sellable: false,
    purchaseable: false,
    useable: true,
    useText: 'Yo, head over to the shop to spend your gems!',
    icon: Emojis.GEMS,
    Class: class Gem extends StackableItem { },
    create: (amount: number) => new Items.Gem.Class(Items.Gem, amount),
    _isDef: true
  },
  Key: {
    id: 'key',
    selectionAliases: [ 'keys' ],
    category: ItemCategory.SYSTEM,
    group: ItemGroup.CURRENCY,
    expanded: false,
    tradeable: false,
    sellable: false,
    purchaseable: false,
    useable: true,
    useText: 'Do `use <lootbox>` but with <lootbox> being a lootbox that you own to open it. This will cost one key!',
    icon: Emojis.KEYS,
    Class: class Key extends StackableItem { },
    create: (amount: number) => new Items.Key.Class(Items.Key, amount),
    _isDef: true
  },
  Turtle: {
    id: 'turtle',
    category: ItemCategory.COLLECTABLE,
    group: ItemGroup.COLLECTABLE,
    expanded: false,
    tradeable: true,
    sellable: false,
    purchaseable: false,
    useable: true,
    useText: '🐢',
    icon: '🐢',
    Class: class Turtle extends StackableItem { },
    create: (amount: number) => new Items.Turtle.Class(Items.Turtle, amount)
  },
  FishingLure: {
    id: 'lure',
    category: ItemCategory.FISHING_EQUIPMENT,
    group: ItemGroup.GAME_ASSET,
    expanded: false,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: false,
    icon: '<:use_regular_bait:667784099037052931>',
    Class: class FishingLure extends StackableItem { },
    create: (amount: number) => new Items.FishingLure.Class(Items.FishingLure, amount)
  },
  GoldFishingLure: {
    id: 'gold_lure',
    category: ItemCategory.FISHING_EQUIPMENT,
    group: ItemGroup.GAME_ASSET,
    expanded: false,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: false,
    icon: '<:use_gold_bait:667786302674042901>',
    Class: class GoldFishingLure extends StackableItem { },
    create: (amount: number) => new Items.GoldFishingLure.Class(Items.GoldFishingLure, amount)
  },
  MysticFishingLure: {
    id: 'mystic_lure',
    category: ItemCategory.FISHING_EQUIPMENT,
    group: ItemGroup.GAME_ASSET,
    expanded: false,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: false,
    icon: '<:use_mystic_bait:667786936395759646>',
    Class: class MysticFishingLure extends StackableItem { },
    create: (amount: number) => new Items.MysticFishingLure.Class(Items.MysticFishingLure, amount)
  },
  TreasureFishingLure: {
    id: 'treasure_lure',
    category: ItemCategory.FISHING_EQUIPMENT,
    group: ItemGroup.GAME_ASSET,
    expanded: false,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: false,
    icon: '<:use_treasure_bait:667807893290090516>',
    Class: class TreasureFishingLure extends StackableItem { },
    create: (amount: number) => new Items.TreasureFishingLure.Class(Items.TreasureFishingLure, amount)
  },
  WelcomeGiftLootbox: {
    id: 'welcome_gift',
    category: ItemCategory.SYSTEM,
    group: ItemGroup.LOOTBOX,
    expanded: false,
    tradeable: false,
    sellable: false,
    purchaseable: false,
    useable: false,
    icon: 'TODO',
    Class: class WelcomeGiftLootbox extends StackableItem { },
    create: (amount: number) => new Items.WelcomeGiftLootbox.Class(Items.WelcomeGiftLootbox, amount)
  },
  Letter: {
    id: 'letter',
    category: ItemCategory.UNDEFINED,
    group: ItemGroup.UNDEFINED,
    expanded: true,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: true,
    icon: '✉️',
    Class: Letter,
    create: (title?: string, text?: string, author?: ClubUser) => new Items.Letter.Class(Items.Letter, Items.Letter.id, title, text, author ? author.id : ''),
    parse: (data: any) => new Items.Letter.Class(Items.Letter, data.id, data.meta.title, data.meta.text, data.meta.author)
  },
  Carp: {
    id: 'carp',
    category: ItemCategory.COLLECTABLE,
    group: ItemGroup.COLLECTABLE,
    expanded: true,
    tradeable: true,
    sellable: true,
    purchaseable: false,
    useable: false,
    icon: '🐟',
    Class: GenericFish,
    create: (size: number, caughtAt: Date, stuffed: boolean) => new Items.Carp.Class(Items.Carp, Items.Carp.id, size, caughtAt, stuffed),
    parse: (data: any) => new Items.Carp.Class(Items.Carp, data.id, data.meta.size, data.meta.caughtAt, data.meta.stuffed)
  },
  ProfileSkinBlue: {
    id: 'profile_skin_blue',
    category: ItemCategory.PROFILE_SKIN,
    group: ItemGroup.COLLECTABLE,
    expanded: false,
    tradeable: true,
    sellable: true,
    purchaseable: true,
    useable: false,
    icon: '🔵',
    Class: class ProfileSkinBlue extends StackableItem { },
    create: (amount: number) => new Items.ProfileSkinBlue.Class(Items.ProfileSkinBlue, amount)
  }
}

export const ItemList: ItemPrefab[] = Object.values(Items)

export function findItem(query: string): ItemPrefab {
  query = query.toLowerCase()
  let item = ItemList.find((i) => {
    if (i.id.toLowerCase() === query) return true
    if (i.selectionAliases && i.selectionAliases.includes(query)) return true
    if (TudeApi.clubLang['item_' + i.id]) {
      if ((TudeApi.clubLang['item_' + i.id]).toLowerCase() === query)
        return true
    }
    return false
  })
  if (!item) {
    item = ItemList.find((i) => {
      if (TudeApi.clubLang['item_' + i.id]) {
        if ((TudeApi.clubLang['item_' + i.id]).toLowerCase().includes(query))
          return true
      }
      return false
    })
  }
  return item
}
