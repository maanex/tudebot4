"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=itemlist.js.map