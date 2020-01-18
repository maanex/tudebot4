
export const getItemIcon = id => itemIconList[id] || itemIconDefault;

export const itemIconDefault = '❔';

export const itemIconList = {
    'turtle': '🐢',
    'fish_bait': '<:use_regular_bait:667784099037052931>',
    'fish_bait_gold': '<:use_gold_bait:667786302674042901>',
    'fish_bait_mystic': '<:use_mystic_bait:667786936395759646>',
    'fish_bait_treasure': '<:use_treasure_bait:667807893290090516>',
};