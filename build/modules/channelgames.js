"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types");
const emojis_1 = require("../int/emojis");
class QuotesModule extends types_1.Module {
    constructor(bot, conf, data, lang) {
        super('Module Name', 'private', bot, conf, data, lang);
    }
    onEnable() {
        this.bot.on('messageReactionAdd', (reaction, user) => {
            if (user.bot)
                return;
            if (!reaction.message.guild)
                return;
        });
        this.bot.on('messageReactionRemove', (reaction, user) => {
            if (user.bot)
                return;
            if (!reaction.message.guild)
                return;
        });
        for (let game in games) {
            games[game](this.bot, this.conf[game], this.data, this.lang);
        }
    }
    onBotReady() {
    }
    onDisable() {
        for (let game in games)
            if (game['onDisable'])
                game['onDisable']();
    }
}
exports.default = QuotesModule;
let games = {
    'fishing': (bot, conf, data, lang) => {
        let emojis = {
            wave: '<:wv:664896117963620395>',
            lbwave: '<:rl:665184934947848202>',
            rbwave: '<:rr:665184935048642570>',
            rod: '🎣',
            zerowidth: '​',
            bait: {
                regular: ':use_regular_bait:667784099037052931',
                gold: ':use_gold_bait:667786302674042901',
                mystic: ':use_mystic_bait:667786936395759646',
                treasure: ':use_treasure_bait:667807893290090516',
            },
            angelfish: ['<:wf1:664896117690990610>'],
            blowfish: ['<:wf2:664896118089449473>'],
            NAMEHERE: ['<:wf3:664896117200388146>'],
            crab: ['<:wf4:664896117829533716>'],
            squid: ['<:wf5:664896117447589891>'],
            shell: ['<:wf6:664908411850326046>'],
            frog: ['<:wf7:664908412139733005>'],
            shrimp: ['<:wf8:664908412920004659>'],
            trout: ['<:wf9:664908413171400732>'],
            carp: ['<:wf10:664908413028925440>'],
            rainbow_trout: ['<:wf11:664908413087514632>'],
            salmon: ['<:wf12:664908412554838036>'],
            inlineBounds: {
                normalBait: ['<:bo1:665186063274475540>', '<:bo2:664896118169272330>', '<:bo3:664896118663938078>', '<:bo4:664896117758230554>', '<:bo5:664896117644722209>', '<:bo6:664896118265479207>', '<:bo7:664896117716156437>', '<:bo8:665186063433859072>'],
                goldBait: ['<:bb1:665186062431420447>', '<:bb2:664896118114746379>', '<:bb3:664896117997043753>', '<:bb4:664896118055895040>', '<:bb5:664896118504816640>', '<:bb6:664896117938585613>', '<:bb7:664896118651486251>', '<:bb8:665186062892531732>'],
                title: ['<:t1:665189987024633856>', '<:t2:665189986949267486>', '<:t3:665189986496413728>', '<:t4:665189986894610452>', '<:t5:665189986890416168>', '<:t6:665189986995273758>', '<:t7:665189986928427038>', '<:t8:665189986932490242>']
            }
        };
        let messages = [];
        let messagesIds = [];
        let emptyWaveText = '';
        let ticktimer;
        let resetDisplayTimer;
        let playing = new Map();
        let timeSinceLastFish = 0;
        let currentFish = null;
        let caughtBy = [];
        let caughtByNames = [];
        function findMessages() {
            return new Promise((resolve, reject) => {
                let path = conf['channel'].split('/');
                bot.guilds.get(path[0]).channels.get(path[1]).fetchMessages().then(mes => {
                    mes.forEach(m => {
                        if (conf['messages'].includes(m.id)) {
                            messages.push(m);
                            messagesIds.push(m.id);
                        }
                    });
                    messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                    resolve();
                }).catch(reject);
            });
        }
        function resetMessages() {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let raw = emojis.lbwave;
                for (let i = 0; i < 6; i++)
                    raw += emojis.wave;
                raw += emojis.rbwave + emojis_1.default.bigSpace;
                emptyWaveText = raw;
                let c = 0;
                let title = emojis.inlineBounds.title.join('') + emojis_1.default.bigSpace;
                let border1 = emojis.inlineBounds.goldBait.join('') + emojis_1.default.bigSpace;
                let border2 = emojis.inlineBounds.normalBait.join('') + emojis_1.default.bigSpace;
                for (let m of messages) {
                    let text = '';
                    if (++c == 1)
                        text = title;
                    else if (c == 4)
                        text = border1;
                    else if (c == 7)
                        text = border2;
                    else if (c == 11)
                        text = '`                                                   `\n`                                                   `*' + emojis_1.default.bigSpace + emojis_1.default.bigSpace + '*';
                    else
                        text = raw;
                    if (m.content !== text)
                        yield m.edit(text);
                }
                resolve();
            }));
        }
        function resetReactions() {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                messages[messages.length - 1].clearReactions();
                setTimeout(() => {
                    let c = 0;
                    for (let emoji of [emojis.rod, ...Object.values(emojis.bait)])
                        setTimeout(() => messages[messages.length - 1].react(emoji), c++ * 1000);
                    resolve();
                }, 2000);
            }));
        }
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                yield findMessages();
                yield resetMessages();
                yield resetReactions();
                ticktimer = setInterval(tick, 1000);
            });
        }
        bot.on('ready', init);
        bot.on('messageReactionAdd', (reaction, user) => {
            if (user.bot)
                return;
            if (!messagesIds.includes(reaction.message.id))
                return;
            if (reaction.emoji.name == emojis.rod) {
                if (!playing.has(user.id)) {
                    let idleremovetimer = setTimeout(() => forceRemoveUser(user), 5 * 60000);
                    let player = { user, idleremovetimer };
                    playing.set(user.id, player);
                    if (playing.size == 1) // Restart basically
                        timeSinceLastFish = 0;
                    parseBait(player, reaction.message);
                }
            }
            else if (false) {
                // TODO collect fish in inventory here
            }
            else {
                let player = playing.get(user.id);
                if (!player)
                    return;
                parseBaitName(player, reaction.emoji.name).then(remove => {
                    if (remove) {
                        reaction.remove(user);
                    }
                    else {
                        for (let r of reaction.message.reactions.values()) {
                            if (r.emoji.name.startsWith('use_')
                                && r.emoji.id !== reaction.emoji.id
                                && r.users.get(user.id) !== undefined) {
                                r.remove(user);
                            }
                        }
                    }
                });
            }
        });
        bot.on('messageReactionRemove', (reaction, user) => {
            if (user.bot)
                return;
            if (!messagesIds.includes(reaction.message.id))
                return;
            if (reaction.emoji.name == emojis.rod) {
                if (playing.has(user.id)) {
                    catchFish(user);
                    clearTimeout(playing.get(user.id).idleremovetimer);
                    playing.delete(user.id);
                }
            }
            else if (false) {
                // TODO collect fish in inventory here
            }
            else {
                let reacted = false;
                for (let r of reaction.message.reactions.values()) {
                    if (r.emoji.name.startsWith('use_')
                        && r.users.get(user.id) !== undefined) {
                        reacted = true;
                        break;
                    }
                }
                if (!reacted) {
                    let player = playing.get(user.id);
                    if (player) {
                        player.bait = undefined;
                        player.bait_itemname = '';
                    }
                }
            }
        });
        function parseBait(player, message) {
            return __awaiter(this, void 0, void 0, function* () {
                let found = false;
                for (let r of message.reactions.values()) {
                    if (r.emoji.name.startsWith('use_')
                        && r.users.get(player.user.id) !== undefined) {
                        if (found) {
                            r.remove(player.user);
                        }
                        else {
                            if (yield parseBaitName(player, r.emoji.name))
                                r.remove(player.user);
                            else
                                found = true;
                        }
                    }
                }
            });
        }
        function parseBaitName(player, emoji) {
            return __awaiter(this, void 0, void 0, function* () {
                // player.bait = undefined;
                // player.bait_itemname = '';
                let bait = undefined;
                switch (emoji) {
                    case 'use_regular_bait':
                        bait = 'regular';
                        break;
                    case 'use_gold_bait':
                        bait = 'gold';
                        break;
                    case 'use_mystic_bait':
                        bait = 'mystic';
                        break;
                    case 'use_treasure_bait':
                        bait = 'treasure';
                        break;
                }
                let u = yield tudeapi_1.default.clubUserByDiscordId(player.user.id);
                let itemname = ((bait == 'regular') ? ('lure') : (bait + '_lure'));
                console.log(itemname);
                if (u.inventory.get(itemname) && u.inventory.get(itemname).amount > 1) {
                    player.bait = bait;
                    player.bait_itemname = itemname;
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        function forceRemoveUser(user) {
            playing.delete(user.id);
            messages[messages.length - 1].reactions.get(emojis.rod).remove(user);
            if (playing.size == 0)
                messages[10].edit('`                                                   `\n`                                                   `*' + emojis_1.default.bigSpace + emojis_1.default.bigSpace + '*');
        }
        function tick() {
            if (playing.size == 0)
                return;
            timeSinceLastFish++;
            let spawn = Math.random() * Math.random() * Math.random() * timeSinceLastFish / 10;
            if (playing.size)
                console.log(playing.values().next().value.bait);
            if (spawn < 1)
                return;
            let possibleBaits = [];
            for (let player of playing.values())
                if (!possibleBaits.includes(player.bait))
                    possibleBaits.push(player.bait);
            let baitType = Math.random() < .5 ? undefined : possibleBaits[Math.floor(Math.random() * possibleBaits.length)];
            let area = baitType ? 'gold-bait-only' : 'regular';
            if (baitType == 'regular')
                area = 'bait-only';
            spawnFish(area, baitType);
            timeSinceLastFish = possibleBaits.length * 4;
        }
        function catchFish(u) {
            if (caughtBy.includes(u.id))
                return;
            if (!currentFish)
                return;
            caughtBy.push(u.id);
            caughtByNames.push(u.username);
            let fish = currentFish;
            tudeapi_1.default.clubUserByDiscordId(u.id).then(u => {
                let worth = fish.worth;
                if (worth < 0)
                    worth = 0;
                u.cookies += worth;
                u.points += Math.min(worth / 5, 20);
                tudeapi_1.default.updateClubUser(u);
                // TODO fisch ins inventar hinzufügen
            }).catch();
        }
        function spawnFish(area, baitType) {
            timeSinceLastFish = 0;
            let fish = generateFish(area, baitType);
            let position = Math.floor(Math.random() * 6) + 1;
            let text = emojis.lbwave;
            for (let i = 1; i < 7; i++)
                text += (position == i ? getEmojiForFish(fish) : emojis.wave);
            text += emojis.rbwave + emojis_1.default.bigSpace;
            let validLines = [];
            switch (area) {
                case 'regular':
                    validLines = [7, 8, 9];
                    break;
                case 'bait-only':
                    validLines = [4, 5];
                    break;
                case 'gold-bait-only':
                    validLines = [1, 2];
                    break;
            }
            let message = messages[validLines[Math.floor(Math.random() * validLines.length)]];
            currentFish = fish;
            caughtBy = [];
            caughtByNames = [];
            message.edit(text).then(() => {
                setTimeout((fish) => {
                    currentFish = null;
                    message.edit(emptyWaveText);
                    let linewidth = '                                                   ';
                    let worth = fish.worth;
                    if (fish.worth == 0)
                        worth = 'nothing';
                    else if (fish.worth < 0)
                        worth = 'absolutely nothing, put it back.';
                    else
                        worth += ' 🍪';
                    let line1 = `Last Fish: ${fish.size}cm ${fish.name} (${fish.rarity}), Worth ${worth}`;
                    let line2 = caughtBy.length ? `Caught by: ${caughtByNames.join(', ')}` : 'Caught by nobody.';
                    let total = '';
                    for (let line of [line1, line2]) {
                        for (let s of line.split(' ')) {
                            let space = '';
                            let currlength = total.split('`\n`')[total.split('`\n`').length - 1].length;
                            if (currlength + s.length + 1 > linewidth.length) {
                                for (let i = 0; i < linewidth.length - currlength; i++)
                                    space += ' ';
                                total += space + '`\n`' + s;
                            }
                            else
                                total += (currlength == 0 ? '' : ' ') + s;
                        }
                        let currlength = total.split('`\n`')[total.split('`\n`').length - 1].length;
                        let space = '';
                        for (let i = 0; i < linewidth.length - currlength; i++)
                            space += ' ';
                        total += space + '`\n`';
                    }
                    messages[10].edit('`' + total.substring(0, total.length - 4) + ' `' + emojis_1.default.bigSpace + emojis_1.default.bigSpace);
                    caughtBy = [];
                    caughtByNames = [];
                    clearTimeout(resetDisplayTimer);
                    resetDisplayTimer = setTimeout(() => {
                        messages[10].edit('`                                                   `\n`                                                   `*' + emojis_1.default.bigSpace + emojis_1.default.bigSpace + '*');
                    }, 20000);
                }, 2000 + Math.floor(Math.random() * Math.random() * 4000), fish);
            });
        }
        function generateFish(area, baitType) {
            let type, name, size, worth, rarity;
            const selectType = () => {
                let allRarities = {
                    no_bait: {
                        angelfish: 40,
                        blowfish: 20,
                        NAMEHERE: 0,
                        crab: 10,
                        squid: 10,
                        shell: 10,
                        frog: 1,
                        shrimp: 10,
                        trout: 30,
                        carp: 40,
                        rainbow_trout: 5,
                        salmon: 30,
                    },
                    regular: {
                        angelfish: 10,
                        blowfish: 20,
                        NAMEHERE: 0,
                        crab: 15,
                        squid: 15,
                        shell: 15,
                        frog: 1,
                        shrimp: 15,
                        trout: 15,
                        carp: 10,
                        rainbow_trout: 10,
                        salmon: 15,
                    },
                    gold: {
                        salmon: 1,
                    },
                    mystic: {
                        salmon: 1,
                    },
                    treasure: {
                        salmon: 1,
                    }
                };
                let rarities = allRarities[baitType || 'no_bait'];
                let total = 0;
                Object.values(rarities).forEach(v => total += v);
                let selection = Math.floor(Math.random() * total);
                for (let name in rarities) {
                    type = name;
                    if ((selection -= rarities[name]) <= 0)
                        break;
                }
            };
            selectType();
            const setSizeAndRarity = () => {
                switch (type) {
                    case 'angelfish':
                        size = 70 + Math.floor(Math.random() * (150 - 70));
                        rarity = 'common';
                        if (Math.random() < .1)
                            size += 10;
                        if (Math.random() < .1)
                            size += 10;
                        if (Math.random() < .1)
                            size += 10;
                        if (Math.random() < .1)
                            size += 10;
                        if (Math.random() < .1)
                            size += 10;
                        if (size > 150)
                            rarity = 'rare';
                        break;
                    case 'blowfish':
                        size = 800 + Math.floor(Math.random() * Math.random() * 400);
                        rarity = 'uncommon';
                        break;
                    case 'NAMEHERE':
                        size = 0;
                        rarity = 'yeet?';
                        break;
                    case 'crab':
                        size = 250 + Math.floor(Math.random() * 100);
                        rarity = 'rare';
                        if (Math.random() < 0.01) {
                            size = 1500 + Math.floor(Math.random() * 300);
                            rarity = 'very rare';
                        }
                        break;
                    case 'squid':
                        size = 300 + Math.floor(Math.random() * 600);
                        rarity = 'rare';
                        break;
                    case 'shell':
                        size = 50 + Math.floor(Math.random() * Math.random() * 100);
                        rarity = 'rare';
                        break;
                    case 'frog':
                        size = 50 + Math.floor(Math.random() * Math.random() * 200);
                        rarity = 'questionable';
                        break;
                    case 'shrimp':
                        size = 70 + Math.floor(Math.random() * Math.random() * 60);
                        rarity = 'rare';
                        break;
                    case 'trout':
                        rarity = 'common';
                    case 'rainbow_trout':
                        rarity = rarity || 'very rare';
                        size = 150 + Math.floor(Math.random() * Math.random() * 350);
                        if (Math.random() < 0.1)
                            size = 150 + Math.floor(Math.random() * Math.random() * 850);
                        break;
                    case 'carp':
                        size = 400 + Math.floor(Math.random() * Math.random() * 400);
                        rarity = 'common';
                        break;
                    case 'salmon':
                        size = 700 + Math.floor(Math.random() * Math.random() * 700);
                        rarity = 'common';
                        break;
                }
                size /= 10;
            };
            setSizeAndRarity();
            const determineName = () => {
                switch (type) {
                    case 'NAMEHERE':
                        name = 'NAMEHERE';
                        break;
                    case 'crab':
                        name = 'Crab';
                        if (size > 100)
                            name = 'Red king crab';
                        break;
                    case 'rainbow_trout':
                        name = 'Rainbow Trout';
                        break;
                    case 'rainbow_trout':
                        name = 'Rainbow Trout';
                        if (size > 500)
                            name = 'Giant Rainbow Trout';
                        break;
                    case 'trout':
                        name = 'Trout';
                        if (size > 500)
                            name = 'Giant Trout';
                        break;
                    default:
                        name = type[0].toUpperCase() + type.slice(1);
                        break;
                }
            };
            determineName();
            const calculatePrice = () => {
                switch (type) {
                    case 'angelfish':
                        if (size < 13)
                            worth = 1;
                        if (size < 15)
                            worth = 2;
                        else
                            worth = 3;
                        break;
                    case 'blowfish':
                        if (size < 100)
                            worth = 1;
                        else
                            worth = 2;
                        break;
                    case 'NAMEHERE':
                        worth = 0;
                        break;
                    case 'crab':
                        if (size < 30)
                            worth = 1;
                        if (size < 35)
                            worth = 2;
                        else
                            worth = 25;
                        break;
                    case 'squid':
                        if (size < 50)
                            worth = 1;
                        else
                            worth = 2;
                        break;
                    case 'shell':
                        worth = 0;
                        break;
                    case 'frog':
                        worth = -1;
                        break;
                    case 'shrimp':
                        worth = 1;
                        break;
                    case 'trout':
                        if (size < 35)
                            worth = 1;
                        else if (size <= 50)
                            worth = 2;
                        else
                            worth = 15;
                        break;
                    case 'rainbow_trout':
                        if (size <= 50)
                            worth = 30;
                        else
                            worth = 100;
                        break;
                    case 'carp':
                        if (size < 60)
                            worth = 1;
                        if (size < 70)
                            worth = 2;
                        if (size < 75)
                            worth = 3;
                        else
                            worth = 4;
                        break;
                    case 'salmon':
                        if (size < 100)
                            worth = 1;
                        if (size < 120)
                            worth = 2;
                        if (size < 130)
                            worth = 3;
                        else
                            worth = 4;
                        break;
                }
            };
            calculatePrice();
            return {
                type: type,
                name: name,
                size: size,
                worth: worth,
                rarity: rarity
            };
        }
        function getEmojiForFish(fish) {
            if (emojis[fish.type])
                return emojis[fish.type][Math.floor(Math.random() * emojis[fish.type].length)];
            else
                return ':x:'; // error
        }
        return {
            onDisable() {
                messages = [];
                clearInterval(ticktimer);
            }
        };
    },
    'mine': (bot, conf, data, lang) => {
    }
};
//# sourceMappingURL=channelgames.js.map