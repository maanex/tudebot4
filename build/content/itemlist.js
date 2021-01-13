"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const item_1 = require("../thirdparty/tudeapi/item");
const emojis_1 = require("../int/emojis");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const letter_1 = require("./items/letter");
const generic_fish_1 = require("./items/generic-fish");
exports.defaultItemIcon = '❔';
//
exports.Items = {
    Test: {
        id: 'test',
        category: item_1.ItemCategory.UNDEFINED,
        group: item_1.ItemGroup.UNDEFINED,
        expanded: true,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        useable: false,
        icon: exports.defaultItemIcon,
        Class: class Test extends item_1.ExpandedItem {
        },
        create: (id, meta) => new exports.Items.Test.Class(exports.Items.Test, id, meta)
    },
    Cookie: {
        id: 'cookie',
        selectionAliases: ['cookies'],
        category: item_1.ItemCategory.SYSTEM,
        group: item_1.ItemGroup.CURRENCY,
        expanded: false,
        tradeable: true,
        sellable: false,
        purchaseable: false,
        useable: true,
        useText: 'Yo, head over to the shop to spend your cookies!',
        icon: emojis_1.default.COOKIES,
        Class: class Cookie extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.Cookie.Class(exports.Items.Cookie, amount),
        _isDef: true
    },
    Gem: {
        id: 'gem',
        selectionAliases: ['gems'],
        category: item_1.ItemCategory.SYSTEM,
        group: item_1.ItemGroup.CURRENCY,
        expanded: false,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        useable: true,
        useText: 'Yo, head over to the shop to spend your gems!',
        icon: emojis_1.default.GEMS,
        Class: class Gem extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.Gem.Class(exports.Items.Gem, amount),
        _isDef: true
    },
    Key: {
        id: 'key',
        selectionAliases: ['keys'],
        category: item_1.ItemCategory.SYSTEM,
        group: item_1.ItemGroup.CURRENCY,
        expanded: false,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        useable: true,
        useText: 'Do `use <lootbox>` but with <lootbox> being a lootbox that you own to open it. This will cost one key!',
        icon: emojis_1.default.KEYS,
        Class: class Key extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.Key.Class(exports.Items.Key, amount),
        _isDef: true
    },
    Turtle: {
        id: 'turtle',
        category: item_1.ItemCategory.COLLECTABLE,
        group: item_1.ItemGroup.COLLECTABLE,
        expanded: false,
        tradeable: true,
        sellable: false,
        purchaseable: false,
        useable: true,
        useText: '🐢',
        icon: '🐢',
        Class: class Turtle extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.Turtle.Class(exports.Items.Turtle, amount)
    },
    FishingLure: {
        id: 'lure',
        category: item_1.ItemCategory.FISHING_EQUIPMENT,
        group: item_1.ItemGroup.GAME_ASSET,
        expanded: false,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: false,
        icon: '<:use_regular_bait:667784099037052931>',
        Class: class FishingLure extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.FishingLure.Class(exports.Items.FishingLure, amount)
    },
    GoldFishingLure: {
        id: 'gold_lure',
        category: item_1.ItemCategory.FISHING_EQUIPMENT,
        group: item_1.ItemGroup.GAME_ASSET,
        expanded: false,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: false,
        icon: '<:use_gold_bait:667786302674042901>',
        Class: class GoldFishingLure extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.GoldFishingLure.Class(exports.Items.GoldFishingLure, amount)
    },
    MysticFishingLure: {
        id: 'mystic_lure',
        category: item_1.ItemCategory.FISHING_EQUIPMENT,
        group: item_1.ItemGroup.GAME_ASSET,
        expanded: false,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: false,
        icon: '<:use_mystic_bait:667786936395759646>',
        Class: class MysticFishingLure extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.MysticFishingLure.Class(exports.Items.MysticFishingLure, amount)
    },
    TreasureFishingLure: {
        id: 'treasure_lure',
        category: item_1.ItemCategory.FISHING_EQUIPMENT,
        group: item_1.ItemGroup.GAME_ASSET,
        expanded: false,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: false,
        icon: '<:use_treasure_bait:667807893290090516>',
        Class: class TreasureFishingLure extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.TreasureFishingLure.Class(exports.Items.TreasureFishingLure, amount)
    },
    WelcomeGiftLootbox: {
        id: 'welcome_gift',
        category: item_1.ItemCategory.SYSTEM,
        group: item_1.ItemGroup.LOOTBOX,
        expanded: false,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        useable: false,
        icon: 'TODO',
        Class: class WelcomeGiftLootbox extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.WelcomeGiftLootbox.Class(exports.Items.WelcomeGiftLootbox, amount)
    },
    Letter: {
        id: 'letter',
        category: item_1.ItemCategory.UNDEFINED,
        group: item_1.ItemGroup.UNDEFINED,
        expanded: true,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: true,
        icon: '✉️',
        Class: letter_1.default,
        create: (title, text, author) => new exports.Items.Letter.Class(exports.Items.Letter, exports.Items.Letter.id, title, text, author ? author.id : ''),
        parse: (data) => new exports.Items.Letter.Class(exports.Items.Letter, data.id, data.meta.title, data.meta.text, data.meta.author)
    },
    Carp: {
        id: 'carp',
        category: item_1.ItemCategory.COLLECTABLE,
        group: item_1.ItemGroup.COLLECTABLE,
        expanded: true,
        tradeable: true,
        sellable: true,
        purchaseable: false,
        useable: false,
        icon: '🐟',
        Class: generic_fish_1.default,
        create: (size, caughtAt, stuffed) => new exports.Items.Carp.Class(exports.Items.Carp, exports.Items.Carp.id, size, caughtAt, stuffed),
        parse: (data) => new exports.Items.Carp.Class(exports.Items.Carp, data.id, data.meta.size, data.meta.caughtAt, data.meta.stuffed)
    },
    ProfileSkinBlue: {
        id: 'profile_skin_blue',
        category: item_1.ItemCategory.PROFILE_SKIN,
        group: item_1.ItemGroup.COLLECTABLE,
        expanded: false,
        tradeable: true,
        sellable: true,
        purchaseable: true,
        useable: false,
        icon: '🔵',
        Class: class ProfileSkinBlue extends item_1.StackableItem {
        },
        create: (amount) => new exports.Items.ProfileSkinBlue.Class(exports.Items.ProfileSkinBlue, amount)
    }
};
exports.ItemList = Object.values(exports.Items);
function findItem(query) {
    query = query.toLowerCase();
    let item = exports.ItemList.find((i) => {
        if (i.id.toLowerCase() === query)
            return true;
        if (i.selectionAliases && i.selectionAliases.includes(query))
            return true;
        if (tudeapi_1.default.clubLang['item_' + i.id]) {
            if ((tudeapi_1.default.clubLang['item_' + i.id]).toLowerCase() === query)
                return true;
        }
        return false;
    });
    if (!item) {
        item = exports.ItemList.find((i) => {
            if (tudeapi_1.default.clubLang['item_' + i.id]) {
                if ((tudeapi_1.default.clubLang['item_' + i.id]).toLowerCase().includes(query))
                    return true;
            }
            return false;
        });
    }
    return item;
}
exports.findItem = findItem;
//# sourceMappingURL=itemlist.js.map