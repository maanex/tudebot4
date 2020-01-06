import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge, ClubUser } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');



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
}

interface Card {
    number: number | 'J' | 'Q' | 'K' | 'A';
    color: 'hearts' | 'diamonds' | 'spades' | 'clubs';
}

interface Entry {
    by: User;
    clubuser: ClubUser;
    amount: number;
    cards: Card[];
    dealer: Card[];
    canDraw: boolean;
}

let currentGame = {
    entries: [] as Entry[],
    allowNewEntries: true,
    started: false,
    startIn: 0,
    chatMessage: null as Message,
    deck: [] as Card[]
}
let currentGameTimer = null;

module.exports = {

    name: 'blackjack',
    aliases: [
        'bj',
        'jack'
    ],
    desc: 'Sweet game of Black Jack',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        
        if (args.length < 1) {
            repl(mes.channel, mes.author, 'blackjack <stake>', 'bad', 'Maximum stake: 2000');
            resolve(false);
            return;
        }

        let cookies = args[0] == 'a' ? -42 : parseInt(args[0]);
        if (isNaN(cookies)) {
            repl(mes.channel, mes.author, args[0] + ' is not a valid amount of cookies!');
            resolve(false);
            return;
        }

        if (cookies > Math.random() * 1_000_000 + 100_000) {
            repl(mes.channel, mes.author, 'That is insane!', 'message', `I've never been provoked that much, LEAVE THIS CASINO RIGHT NOW!`);
            resolve(false);
            return;
        }

        if (cookies > 2000) {
            repl(mes.channel, mes.author, args[0] + ' cookies is over the casino\'s maximum stake of 2000!');
            resolve(false);
            return;
        }

        TudeApi.clubUserByDiscordId(mes.author.id, mes.author).then(u => {
            if (!u || u.error) {
                repl(mes.channel, mes.author, 'An error occured!', 'error');
                resolve(false);
                return;
            }
            if (cookies > u.cookies) {
                if (Math.random() < .05) {
                    // @ts-ignore
                    repl(mes.channel, mes.author, `${hidethepain} ${cookies} is more than you have`, 'message', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png', banner: 'https://cdn.discordapp.com/emojis/655169782806609921.png' });
                } else {
                    // @ts-ignore
                    repl(mes.channel, mes.author, `${cookies} is more than you have`, 'message', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png?size=32' });
                }

                resolve(false);
                return;
            }
            if (cookies == -42) {
                if (u.cookies == 0) {
                    repl(mes.channel, mes.author, 'You don\'t have any money to play with!');
                    resolve(false);
                    return;
                }
                cookies = Math.min(5000, u.cookies);
            }
            if (cookies <= 0) {
                repl(mes.channel, mes.author, 'You cannot bet on 0 or less cookies!');
                resolve(false);
                return;
            }

            if (currentGame.started) {
                if (!currentGame.allowNewEntries) {
                    repl(mes.channel, mes.author, 'Please wait a moment, a game is still in progress!');
                    resolve(false);
                    return;
                }
                for (let entry of currentGame.entries) {
                    if (entry.by.id == mes.author.id) {
                        repl(mes.channel, mes.author, 'You have already placed your bet on this game!');
                        resolve(false);
                        return;
                    }
                }
                u.cookies -= cookies;
                TudeApi.updateClubUser(u);
                currentGame.entries.push({
                    by: mes.author,
                    clubuser: u,
                    amount: cookies,
                    cards: [],
                    dealer: [],
                    canDraw: true
                });
                currentGame.startIn = 5;
                if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.entries.length)
                    currentGame.startIn = 10;
                resolve(true);
            } else {
                currentGame.started = true;
                u.cookies -= cookies;
                TudeApi.updateClubUser(u);
                currentGame.entries.push({
                    by: mes.author,
                    clubuser: u,
                    amount: cookies,
                    cards: [],
                    dealer: [],
                    canDraw: true
                });
                currentGame.startIn = 2;
                if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.entries.length)
                    currentGame.startIn = 10;
                resolve(true);
                mes.channel.send({ embed: {
                    color: 0x36393f,
                    title: 'Black Jack',
                    description: 'Preparing...',
                }}).then(mes => currentGame.chatMessage = mes as Message).catch();
                currentGameTimer = setInterval(() => {
                    if (currentGame.startIn == 10 || currentGame.startIn == 5 || currentGame.startIn <= 2) {
                        if (currentGame.chatMessage)
                            currentGame.chatMessage.edit('', { embed: {
                                color: 0x36393f,
                                title: 'Black Jack',
                                description: 'Starting in ' + currentGame.startIn + '```js\n'
                                    + currentGame.entries.map(b => `${b.by.username}: ${b.amount}c`).join('\n')
                                    + '```',
                            }});
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
    }

}

function startGame() {
    if (!currentGame.chatMessage) {
        resetGame();
        return;
    }

    for (let type of [ 'hearts', 'diamonds', 'spades', 'clubs' ])
        for (let value of [ 2, 3, 4, 5, 6, 7, 8, 9, 'J', 'Q', 'K', 'A' ])
            for (let i = 0; i < 6; i++)
                // @ts-ignore
                currentGame.deck.push({ color: type, number: value });

    for (let entry of currentGame.entries) {
        entry.dealer.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
        entry.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
        entry.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
    }

    gameloop();
}

function gameloop(allowDelay = true) {
    let phit = currentGame.chatMessage.reactions.get(hit) && currentGame.chatMessage.reactions.get(hit).users;
    let pstand = currentGame.chatMessage.reactions.get(stand) && currentGame.chatMessage.reactions.get(stand).users;

    if (!phit || !pstand) { // init round
        updateMessage();
        setTimeout(gameloop, 10_000);
    } else {
        let totalReactions = 0;
        let hits = [];
        for (let p of phit.values()) {
            if (p.bot) continue;
            hits.push(p.id);
            totalReactions++;
        }
        for (let p of pstand.values()) {
            if (p.bot) continue;
            if (hits.indexOf(p.id) < 0)
                totalReactions++;
        }
        if (allowDelay && totalReactions < currentGame.entries.length) {
            setTimeout(() => gameloop(false), 3_000);
        } else {
            if (currentGame.chatMessage.reactions.get(hit).count <= 1) {
                gameOver();
            } else {
                let draws = 0;
                for (let e of currentGame.entries) {
                    if (!e.canDraw) continue;
                    if (hits.indexOf(e.by.id) < 0 || countValue(e) >= 21) {
                        e.canDraw = false;
                        continue;
                    }
                    e.cards.push(currentGame.deck.splice(Math.floor(Math.random() * currentGame.deck.length), 1)[0]);
                    console.log(countValue(e));
                    if (countValue(e) >= 21) e.canDraw = false;
                    else draws++;
                }
                if (draws == 0) gameOver();
                else {
                    updateMessage();
                    setTimeout(gameloop, 10_000);
                }
            }
        }
    }
}

function gameOver() {
    updateMessage(true, false, true);
    resetGame();
}

function countValue(entry: Entry): number {
    // @ts-ignore
    // return entry.cards.map(c => c.number).stack();
    let num = 0;
    let aces = 0;
    entry.cards.map(c => c.number).forEach(n => {
        if (typeof n == 'string') {
            if (n == 'A') aces++;
            else num += 10;
        } else num += n as number;
    });
    while (aces > 0) {
        if (aces * 11 + num > 21) num += 1;
        else num += 11;
        aces--;
    }
    return num;
}

function updateMessage(removeEmojis = true, addEmojis = true, end = false) {
    if (removeEmojis) {
        if (currentGame.chatMessage.reactions.get(hit)
         && currentGame.chatMessage.reactions.get(stand)
         && currentGame.chatMessage.reactions.get(hit).count <= 2
         && currentGame.chatMessage.reactions.get(stand).count <= 2) {
            for (let u of currentGame.chatMessage.reactions.get(stand).users.array())
                if (!u.bot)
                    currentGame.chatMessage.reactions.get(stand).remove(u.id);
             currentGame.chatMessage.reactions.get(hit).users.array().filter(u => !u.bot).forEach(currentGame.chatMessage.reactions.get(hit).remove);
            //  currentGame.chatMessage.reactions.get(stand).users.filter(u => !u.bot).forEach(currentGame.chatMessage.reactions.get(stand).remove);
        } else {
            currentGame.chatMessage.clearReactions();
        }
        if (addEmojis) {
            currentGame.chatMessage.react(hit);
            setTimeout(() => currentGame.chatMessage.react(stand), 500);
        }
    }

    currentGame.chatMessage.edit('', { embed: {
        color: 0x36393f,
        title: 'Black Jack',
        description: end ? 'Game Over' : `${hit} hit • ${stand} stand`,
        fields: embedFields()
    }});
}

function resetGame() {
    currentGame = {
        entries: [],
        allowNewEntries: true,
        started: false,
        startIn: 0,
        chatMessage: null as Message,
        deck: [] as Card[]
    }   
}

function embedFields() {
    let out = currentGame.entries
        .map(e => { return {
            name: e.by.username,
            value: `\`  Dealer:\` ${e.dealer.map(cardToEmoji).join(' ')}\n\`     You:\` ${e.cards.map(cardToEmoji).join(' ') + (e.canDraw ? '' : ' **/**')}`.substring(0, 1024)
        }});
    return out;
}

function cardToEmoji(card: Card): string {
    let type = (card.color == 'hearts' || card.color == 'diamonds') ? 'red' : 'black';
    let typeEm = { hearts: hearts, diamonds: diamonds, spades: spades, clubs: clubs }[card.color];
    let num = (typeof card.number == 'number') ? (card.number - 2) : { J: 8, Q: 9, K: 10, A: 11 }[card.number];
    return typeEm + cvalues[type][num];
}