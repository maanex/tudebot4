import { Item as DeprecatedItem } from "./tudeapi";
import { Item, ItemCategory, ItemGroup, StackableItem } from "./item";

export const getItemIcon = id => itemIconList[id] || itemIconDefault;

export const itemIconDefault = '❔';

export const itemIconList = {
    'turtle': '🐢',
    'lure': '<:use_regular_bait:667784099037052931>',
    'gold_lure': '<:use_gold_bait:667786302674042901>',
    'mystic_lure': '<:use_mystic_bait:667786936395759646>',
    'treasure_lure': '<:use_treasure_bait:667807893290090516>',
};

export const DEFAULT_ITEMS = {
    cookie: {   
        id: 'cookie',
        ref: 'cookie',
        name: 'Cookie',
        category: { id: 'system', name: 'System', namepl: 'System' },
        type: { id: 'currency', name: 'Currency', namepl: 'Currency' },
        amount: 1,
        meta: { },
        expanded: false,
        tradeable: true,
        sellable: false,
        purchaseable: false,
        icon: '🍪',
        _isDef: true
    } as DeprecatedItem,
    key: {   
        id: 'key',
        ref: 'key',
        name: 'Key',
        category: { id: 'system', name: 'System', namepl: 'System' },
        type: { id: 'currency', name: 'Currency', namepl: 'Currency' },
        amount: 1,
        meta: { },
        expanded: false,
        tradeable: false,
        sellable: false,
        purchaseable: false,
        icon: '🔑',
        _isDef: true
    } as DeprecatedItem,
}

/*
 *
 */

export class Cookie extends StackableItem {

    constructor( amount: number ) {
        super (
            'cookie',
            amount,
            ItemCategory.SYSTEM,
            ItemGroup.CURRENCY,
            true,
            false,
            false,
            '🍪',
            true
        );
    }

}

//

export class Key extends StackableItem {

    constructor( amount: number ) {
        super (
            'key',
            amount,
            ItemCategory.SYSTEM,
            ItemGroup.CURRENCY,
            true,
            false,
            false,
            '🔑',
            true
        );
    }

}

//

export class Turtle extends StackableItem {

    constructor( amount: number ) {
        super (
            'turtle',
            amount,
            ItemCategory.COLLECTABLE,
            ItemGroup.COLLECTABLE,
            true,
            false,
            false,
            '🐢'
        );
    }

}

//

export class FishingLure extends StackableItem {

    constructor( amount: number ) {
        super (
            'lure',
            amount,
            ItemCategory.FISHING,
            ItemGroup.GAME_ASSET,
            true,
            true,
            true,
            '<:use_regular_bait:667784099037052931>'
        );
    }

}

//

export class GoldFishingLure extends StackableItem {

    constructor( amount: number ) {
        super (
            'gold_lure',
            amount,
            ItemCategory.FISHING,
            ItemGroup.GAME_ASSET,
            true,
            true,
            true,
            '<:use_gold_bait:667786302674042901>'
        );
    }

}

//

export class MysticFishingLure extends StackableItem {

    constructor( amount: number ) {
        super (
            'mystic_lure',
            amount,
            ItemCategory.FISHING,
            ItemGroup.GAME_ASSET,
            true,
            true,
            true,
            '<:use_mystic_bait:667786936395759646>'
        );
    }

}

//

export class TreasureFishingLure extends StackableItem {

    constructor( amount: number ) {
        super (
            'treasure_lure',
            amount,
            ItemCategory.FISHING,
            ItemGroup.GAME_ASSET,
            true,
            true,
            true,
            '<:use_treasure_bait:667807893290090516>'
        );
    }

}

//

export class WelcomeGiftLootbox extends StackableItem {

    constructor( amount: number ) {
        super (
            'welcome_gift_lootbox',
            amount,
            ItemCategory.SYSTEM,
            ItemGroup.LOOTBOX,
            false,
            false,
            false,
            'TODO'
        );
    }

}