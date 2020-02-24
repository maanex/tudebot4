"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const item_1 = require("./item");
exports.getItemIcon = id => exports.itemIconList[id] || exports.itemIconDefault;
exports.itemIconDefault = '❔';
exports.itemIconList = {
    'turtle': '🐢',
    'lure': '<:use_regular_bait:667784099037052931>',
    'gold_lure': '<:use_gold_bait:667786302674042901>',
    'mystic_lure': '<:use_mystic_bait:667786936395759646>',
    'treasure_lure': '<:use_treasure_bait:667807893290090516>',
};
exports.DEFAULT_ITEMS = {
    cookie: {
        id: 'cookie',
        ref: 'cookie',
        name: 'Cookie',
        category: { id: 'system', name: 'System', namepl: 'System' },
        type: { id: 'currency', name: 'Currency', namepl: 'Currency' },
        amount: 1,
        meta: {},
        expanded: false,
        tradeable: true,
        sellable: false,
        purchaseable: false,
        icon: '🍪',
        _isDef: true
    },
    key: {
        id: 'key',
        ref: 'key',
        name: 'Key',
        category: { id: 'system', name: 'System', namepl: 'System' },
        type: { id: 'currency', name: 'Currency', namepl: 'Currency' },
        amount: 1,
        meta: {},
        expanded: false,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        icon: '🔑',
        _isDef: true
    },
};
/*
 *
 */
class Cookie extends item_1.StackableItem {
    constructor(amount) {
        super('cookie', amount, item_1.ItemCategory.SYSTEM, item_1.ItemGroup.CURRENCY, true, false, false, '🍪', true);
    }
}
exports.Cookie = Cookie;
//
class Key extends item_1.StackableItem {
    constructor(amount) {
        super('key', amount, item_1.ItemCategory.SYSTEM, item_1.ItemGroup.CURRENCY, true, false, false, '🔑', true);
    }
}
exports.Key = Key;
//
class Turtle extends item_1.StackableItem {
    constructor(amount) {
        super('turtle', amount, item_1.ItemCategory.COLLECTABLE, item_1.ItemGroup.COLLECTABLE, true, false, false, '🐢');
    }
}
exports.Turtle = Turtle;
//
class FishingLure extends item_1.StackableItem {
    constructor(amount) {
        super('lure', amount, item_1.ItemCategory.FISHING, item_1.ItemGroup.GAME_ASSET, true, true, true, '<:use_regular_bait:667784099037052931>');
    }
}
exports.FishingLure = FishingLure;
//
class GoldFishingLure extends item_1.StackableItem {
    constructor(amount) {
        super('gold_lure', amount, item_1.ItemCategory.FISHING, item_1.ItemGroup.GAME_ASSET, true, true, true, '<:use_gold_bait:667786302674042901>');
    }
}
exports.GoldFishingLure = GoldFishingLure;
//
class MysticFishingLure extends item_1.StackableItem {
    constructor(amount) {
        super('mystic_lure', amount, item_1.ItemCategory.FISHING, item_1.ItemGroup.GAME_ASSET, true, true, true, '<:use_mystic_bait:667786936395759646>');
    }
}
exports.MysticFishingLure = MysticFishingLure;
//
class TreasureFishingLure extends item_1.StackableItem {
    constructor(amount) {
        super('treasure_lure', amount, item_1.ItemCategory.FISHING, item_1.ItemGroup.GAME_ASSET, true, true, true, '<:use_treasure_bait:667807893290090516>');
    }
}
exports.TreasureFishingLure = TreasureFishingLure;
//
class WelcomeGiftLootbox extends item_1.StackableItem {
    constructor(amount) {
        super('welcome_gift_lootbox', amount, item_1.ItemCategory.SYSTEM, item_1.ItemGroup.LOOTBOX, false, false, false, 'TODO');
    }
}
exports.WelcomeGiftLootbox = WelcomeGiftLootbox;
//# sourceMappingURL=itemlist.js.map