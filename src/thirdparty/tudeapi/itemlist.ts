
export const getItemIcon = id => itemIconList[id] || itemIconDefault;

export const itemIconDefault = '❔';

export const itemIconList = {
    'turtle': '🐢',
    'lure': '<:use_regular_bait:667784099037052931>',
    'gold_lure': '<:use_gold_bait:667786302674042901>',
    'mystic_lure': '<:use_mystic_bait:667786936395759646>',
    'treasure_lure': '<:use_treasure_bait:667807893290090516>',
};