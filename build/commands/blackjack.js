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
const fetch = require('node-fetch');
const _bigspace = '<:nothing:409254826938204171>';
const hit = '✅';
const stand = '⏸️';
const hearts = '<:hearts:661657523878625295>';
const diamonds = '<:diamonds:661657523820036106>';
const spades = '<:spades:661657523333496854>';
const clubs = '<:clubs:661657523756990524>';
const cvalues = {
    black: [
        '<:b2:661659488872300584>',
        '<:b3:661659488562184195>',
        '<:b4:661659488847134720>',
        '<:b5:661659488897728522>',
        '<:b6:661659488947929098>',
        '<:b7:661659488528367655>',
        '<:b8:661659488821968981>',
        '<:b9:661659488595738675>',
        '<:bJ:661659488750927902>',
        '<:bQ:661659488872562718>',
        '<:bK:661659488863911936>',
        '<:bA:661659488411058180>',
    ],
    red: [
        '<:r2:661660240168878100>',
        '<:r3:661660240198238208>',
        '<:r4:661660239757836291>',
        '<:r5:661660240160358418>',
        '<:r6:661660240231661578>',
        '<:r7:661660240235855912>',
        '<:r8:661660240093380626>',
        '<:r9:661660240382525466>',
        '<:rJ:661660239929671741>',
        '<:rQ:661660240252633105>',
        '<:rK:661660240227467264>',
        '<:rA:661660239975809085>',
    ]
};
let currentGame = {
    entries: [],
    dealer: [],
    allowNewEntries: true,
    started: false,
    startIn: 0,
    chatMessage: null,
    deck: []
};
let currentGameTimer = null;
module.exports = {
    name: 'blackjack',
    aliases: [
        'bj',
        'jack'
    ],
    desc: 'Sweet game of Black Jack',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            if (args.length < 1) {
                repl(mes.channel, mes.author, 'blackjack <stake>', 'bad', 'Maximum stake: 2000');
                resolve(false);
                return;
            }
            let cookies = args[0] == 'a' ? -42 : parseInt(args[0]);
            if (isNaN(cookies)) {
                repl(mes.channel, mes.author, args[0] + ' is not a valid amount of cookies!', 'bad');
                resolve(false);
                return;
            }
            if (cookies > Math.random() * 1000000 + 100000) {
                repl(mes.channel, mes.author, 'That is insane!', 'bad', `I've never been provoked that much, LEAVE THIS CASINO RIGHT NOW!`);
                resolve(false);
                return;
            }
            if (cookies > 2000) {
                repl(mes.channel, mes.author, args[0] + ' cookies is over the casino\'s maximum stake of 2000!', 'bad');
                resolve(false);
                return;
            }
            tudeapi_1.default.clubUserByDiscordId(mes.author.id, mes.author).then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'Couldn\'t fetch your userdata!', 'bad', 'That\'s not cool.');
                    resolve(false);
                    return;
                }
                if (cookies > u.cookies) {
                    if (Math.random() < .05) {
                        // @ts-ignore
                        repl(mes.channel, mes.author, `${hidethepain} ${cookies} is more than you have`, 'bad', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png', banner: 'https://cdn.discordapp.com/emojis/655169782806609921.png' });
                    }
                    else {
                        // @ts-ignore
                        repl(mes.channel, mes.author, `${cookies} is more than you have`, 'bad', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png?size=32' });
                    }
                    resolve(false);
                    return;
                }
                if (cookies == -42) {
                    if (u.cookies == 0) {
                        repl(mes.channel, mes.author, 'You don\'t have any money to play with!', 'bad');
                        resolve(false);
                        return;
                    }
                    cookies = Math.min(2000, u.cookies);
                }
                if (cookies <= 0) {
                    repl(mes.channel, mes.author, 'You cannot bet on 0 or less cookies!', 'bad');
                    resolve(false);
                    return;
                }
                if (currentGame.started) {
                    if (!currentGame.allowNewEntries) {
                        repl(mes.channel, mes.author, 'Please wait a moment, a game is still in progress!', 'bad');
                        resolve(false);
                        return;
                    }
                    for (let entry of currentGame.entries) {
                        if (entry.by.id == mes.author.id) {
                            repl(mes.channel, mes.author, 'You have already placed your bet on this game!', 'bad');
                            resolve(false);
                            return;
                        }
                    }
                    u.cookies -= cookies;
                    tudeapi_1.default.updateClubUser(u);
                    currentGame.entries.push({
                        by: mes.author,
                        clubuser: u,
                        amount: cookies,
                        cards: [],
                        canDraw: true,
                        balance: 0
                    });
                    // currentGame.startIn = 5;
                    // if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.entries.length)
                    // currentGame.startIn = 10;
                    currentGame.startIn = 5;
                    resolve(true);
                }
                else {
                    currentGame.started = true;
                    u.cookies -= cookies;
                    tudeapi_1.default.updateClubUser(u);
                    currentGame.entries.push({
                        by: mes.author,
                        clubuser: u,
                        amount: cookies,
                        cards: [],
                        canDraw: true,
                        balance: 0
                    });
                    // currentGame.startIn = 3;
                    // if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.entries.length)
                    currentGame.startIn = 10;
                    resolve(true);
                    mes.channel.send({ embed: {
                            color: 0x2f3136,
                            title: 'Black Jack',
                            description: 'Preparing...'
                        } }).then(mes => currentGame.chatMessage = mes).catch();
                    currentGameTimer = setInterval(() => {
                        if (currentGame.startIn == 10 || currentGame.startIn == 5 || currentGame.startIn <= 2) {
                            if (currentGame.chatMessage)
                                currentGame.chatMessage.edit('', { embed: {
                                        color: 0x2f3136,
                                        title: 'Black Jack',
                                        description: 'Starting in ' + currentGame.startIn + '```js\n'
                                            + currentGame.entries.map(b => `${b.by.username}: ${b.amount}c`).join('\n')
                                            + '```',
                                    } });
                        }
                        if (currentGame.startIn-- <= 0) {
                            currentGame.allowNewEntries = false;
                            clearInterval(currentGameTimer);
                            startGame();
                        }
                    }, 1000);
                }
            }).catch(err => {
                console.error(err);
                repl(mes.channel, mes.author, 'An error occured!', 'error');
            });
        });
    },
    init(bot) {
        bot.on('messageReactionAdd', (reaction, user) => {
            if (!currentGame)
                return;
            if (user.bot)
                return;
            if (!currentGame || !currentGame.chatMessage)
                return;
            if (reaction.message.id !== currentGame.chatMessage.id)
                return;
            let playing = undefined;
            for (let e of currentGame.entries)
                if (e.by.id === user.id) {
                    playing = e;
                    break;
                }
            if (!playing)
                return;
            switch (reaction.emoji.name) {
                case hit:
                    playing.choosenAction = 'hit';
                    break;
                case stand:
                    playing.choosenAction = 'stand';
                    break;
            }
            for (let e of currentGame.entries)
                if (e.canDraw && !e.choosenAction)
                    return;
            gameloop();
        });
    },
};
function startGame() {
    if (!currentGame.chatMessage) {
        resetGame();
        return;
    }
    for (let type of ['hearts', 'diamonds', 'spades', 'clubs'])
        for (let value of [2, 3, 4, 5, 6, 7, 8, 9, 'J', 'Q', 'K', 'A'])
            for (let i = 0; i < 6; i++)
                // @ts-ignore
                currentGame.deck.push({ color: type, number: value });
    currentGame.dealer.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
    for (let entry of currentGame.entries) {
        entry.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
        entry.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
        if (Math.abs(countValue(entry.cards)) == 21)
            entry.canDraw = false;
    }
    gameloop(true);
}
let gameloopTimeoutTimer = undefined;
function gameloop(firstRound = false) {
    if (gameloopTimeoutTimer)
        clearTimeout(gameloopTimeoutTimer);
    gameloopTimeoutTimer = setTimeout(gameloop, 15000);
    if (firstRound) {
        for (let e of currentGame.entries)
            if (e.canDraw) {
                updateMessage();
                return;
            }
        gameOver();
        return;
    }
    for (let e of currentGame.entries)
        e.choosenAction = e.choosenAction || 'stand';
    for (let e of currentGame.entries) {
        if (!e.canDraw)
            continue;
        switch (e.choosenAction) {
            case 'hit':
                e.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
                let value = countValue(e.cards);
                if (Math.abs(value) >= 21)
                    e.canDraw = false;
                break;
            case 'stand':
                e.canDraw = false;
                break;
        }
    }
    let done = true;
    for (let e of currentGame.entries) {
        e.choosenAction = undefined;
        if (e.canDraw)
            done = false;
    }
    if (!done)
        updateMessage();
    else
        gameOver();
}
function gameOver() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gameloopTimeoutTimer)
            clearTimeout(gameloopTimeoutTimer);
        do
            currentGame.dealer.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
        while (countValue(currentGame.dealer) < 17);
        let dealerVal = Math.abs(countValue(currentGame.dealer));
        for (let e of currentGame.entries) {
            let val = Math.abs(countValue(e.cards));
            if (val > 21)
                e.balance = -e.amount;
            else if (val == 21 && e.cards.length == 2)
                e.balance = e.amount * 3 / 2;
            else if (dealerVal > 21)
                e.balance = e.amount;
            else if (val > dealerVal)
                e.balance = e.amount;
            else if (val == dealerVal)
                e.balance = 0;
            else if (val < dealerVal)
                e.balance = -e.amount;
            e.clubuser.cookies += Math.ceil(e.amount + e.balance);
            if ((e.amount + e.balance) != 0)
                tudeapi_1.default.updateClubUser(e.clubuser);
        }
        yield updateMessage(true, false, true);
        resetGame();
    });
}
function countValue(cards) {
    // @ts-ignore
    // return entry.cards.map(c => c.number).stack();
    let num = 0;
    let aces = 0;
    cards.map(c => c.number).forEach(n => {
        if (typeof n == 'string') {
            if (n == 'A')
                aces++;
            else
                num += 10;
        }
        else
            num += n;
    });
    let soft = false;
    while (aces > 0) {
        if (aces * 11 + num > 21)
            num += 1;
        else {
            num += 11;
            soft = true;
        }
        aces--;
    }
    return soft ? -num : num;
}
function updateMessage(removeEmojis = true, addEmojis = true, end = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentGame.chatMessage)
            return;
        if (removeEmojis) {
            if (addEmojis
                && currentGame.chatMessage.reactions.get(hit)
                && currentGame.chatMessage.reactions.get(stand)
                && currentGame.chatMessage.reactions.get(hit).count <= 2
                && currentGame.chatMessage.reactions.get(stand).count <= 2) {
                for (let u of currentGame.chatMessage.reactions.get(stand).users.array())
                    if (!u.bot)
                        yield currentGame.chatMessage.reactions.get(stand).remove(u.id);
                for (let u of currentGame.chatMessage.reactions.get(hit).users.array())
                    if (!u.bot)
                        yield currentGame.chatMessage.reactions.get(hit).remove(u.id);
                // currentGame.chatMessage.reactions.get(hit).users.array().filter(u => !u.bot).forEach(currentGame.chatMessage.reactions.get(hit).remove);
                //  currentGame.chatMessage.reactions.get(stand).users.filter(u => !u.bot).forEach(currentGame.chatMessage.reactions.get(stand).remove);
            }
            else {
                yield currentGame.chatMessage.clearReactions();
            }
            if (addEmojis) {
                let mes = currentGame.chatMessage;
                currentGame.chatMessage.react(hit).then(() => mes.react(stand)).catch();
            }
        }
        currentGame.chatMessage.edit('', { embed: {
                color: 0x2f3136,
                title: 'Black Jack',
                description: (end ? 'Game Over' : `${hit} hit • ${stand} stand`) + `\n${_bigspace}`,
                fields: embedFields(end)
            } });
    });
}
function resetGame() {
    currentGame = {
        entries: [],
        allowNewEntries: true,
        started: false,
        startIn: 0,
        chatMessage: null,
        deck: [],
        dealer: []
    };
}
function embedFields(end) {
    let dealerVal = countValue(currentGame.dealer);
    if (dealerVal == -21 && currentGame.dealer.length == 2)
        dealerVal = 'BLACK JACK';
    if (dealerVal > 21)
        dealerVal = 'BURST ' + dealerVal;
    if (dealerVal == 21 && currentGame.dealer.length == 2)
        dealerVal = 'BLACK JACK';
    if (typeof dealerVal == 'number' && dealerVal < 0)
        dealerVal *= -1;
    // @ts-ignore
    let len = currentGame.entries.map(e => e.by.username.length).iterate((e, curr) => { curr > (e || 0) ? curr : (e || 0); }) + 2;
    let out = currentGame.entries
        .map(e => {
        let yourVal = countValue(e.cards);
        if (yourVal == -21 && e.cards.length == 2)
            yourVal = 'BLACK JACK';
        if (yourVal < 0)
            yourVal = 'Soft' + -yourVal;
        if (yourVal > 21)
            yourVal = 'BURST ' + yourVal;
        if (typeof yourVal == 'number' && yourVal < 0)
            yourVal *= -1;
        // return `\`${(' '.repeat(len) + e.by.username).substring(-len)}:\` **${yourVal}** ${e.cards.map(cardToEmoji).join(' ') + (e.canDraw ? '' : ' **/**')}`;
        let endtext = '';
        if (end) {
            endtext += '\n';
            if (e.balance == 0)
                endtext += '**STAND OFF**';
            else if (e.balance < 0)
                endtext += '**LOOSE**';
            else if (e.balance > 0)
                endtext += '**WIN**';
            endtext += _bigspace;
            endtext += (e.balance < 0 ? '' : '+') + e.balance + 'c • ' + e.clubuser.cookies + 'c total';
        }
        return {
            name: e.by.username,
            value: `**${yourVal}** ${e.cards.map(cardToEmoji).join(' ') + (e.canDraw ? '' : ' **/**') + endtext}`
        };
    });
    return [
        {
            name: '`  Dealer  `',
            value: `**${dealerVal}** ${currentGame.dealer.map(cardToEmoji).join(' ')}`
        }, ...out
    ];
}
function cardToEmoji(card) {
    let type = (card.color == 'hearts' || card.color == 'diamonds') ? 'red' : 'black';
    let typeEm = { hearts: hearts, diamonds: diamonds, spades: spades, clubs: clubs }[card.color];
    let num = (typeof card.number == 'number') ? (card.number - 2) : { J: 8, Q: 9, K: 10, A: 11 }[card.number];
    return typeEm + cvalues[type][num];
}
//# sourceMappingURL=blackjack.js.map