import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');



const hidethepain = '<:hidethepain:655169782806609921>';
const images = [
    'https://cdn.discordapp.com/attachments/655354019631333397/655357917431726090/r0.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357922662023181/r1.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357941586722846/r2.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357946774945793/r3.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357972377239583/r4.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357978475626509/r5.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357983773032448/r6.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357987623534615/r7.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655357995823267840/r8.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358000629809152/r9.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358005746860033/r10.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358012323790848/r11.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358032343072768/r12.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358042644152322/r13.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358051775152138/r14.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358066509742080/r15.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358074084917258/r16.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358080015400970/r17.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358096872570888/r18.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358101792358421/r19.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358113255391233/r20.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358120272461825/r21.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358125712474112/r22.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358132926545920/r23.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358141894098955/r24.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358147703341065/r25.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358155760467971/r26.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358162244730900/r27.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358167672160266/r28.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358174173593610/r29.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358179340845056/r30.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358186399858713/r31.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358220407406593/r32.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358234223443978/r33.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358239398952980/r34.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358244314808320/r35.png',
    'https://cdn.discordapp.com/attachments/655354019631333397/655358248651718656/r36.png',
];
const rollingImages = [
    'https://cdn.discordapp.com/attachments/655354019631333397/655360131856596998/rRolling1.gif',
];
const gnomeImage = 'https://cdn.discordapp.com/attachments/655354019631333397/655367018622615552/rGnome.png';

interface Digit {
    number: number;
    color: string;
}

let currentGame = {
    bets: [],
    allowNewBets: true,
    started: false,
    resolveIn: 0,
    chatMessage: null as Message
}
let currentGameTimer = null;

module.exports = {

    name: 'roulette',
    aliases: [
        'r'
    ],
    desc: 'Sweet game of Roulette',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        
        if (args.length < 2) {
            repl(mes.channel, mes.author, 'roulette <bet> <amount>', 'bad', 'bet on: red, black, green, odd, even, 0 - 36');
            resolve(false);
            return;
        }

        let wincondition: (digit: Digit) => boolean = null;
        let wintext: String = '';
        let winfactor: number = 1;

        switch (args[0].toLowerCase()) {
            case 'red':
            case 'r':
                wincondition = d => d.color == 'red';
                wintext = 'red';
                break;
                
            case 'black':
            case 'b':
                wincondition = d => d.color == 'black';
                wintext = 'black';
                break;
                
            case 'even':
            case 'e':
                wincondition = d => d.number % 2 == 0 && d.number > 0;
                wintext = 'even';
                break;
                
            case 'odd':
            case 'o':
                wincondition = d => d.number % 2 == 1;
                wintext = 'odd';
                break;

            case 'green':
            case 'g':
                args[0] = '0';
            default:
                if (isNaN(parseInt(args[0]))) break;
                if (parseInt(args[0]) < 0 || parseInt(args[0]) > 36) break;
                wincondition = d => d.number == parseInt(args[0]);
                wintext = args[0];
                winfactor = 36;
        }

        if (!wincondition) {
            repl(mes.channel, mes.author, args[0] + ' is not a valid bet!', 'bad');
            resolve(false);
            return;
        }

        let cookies = args[1] == 'a' ? -42 : parseInt(args[1]);
        if (isNaN(cookies)) {
            repl(mes.channel, mes.author, args[1] + ' is not a valid amount of cookies!', 'bad');
            resolve(false);
            return;
        }

        if (cookies > Math.random() * 1_000_000 + 100_000) {
            repl(mes.channel, mes.author, 'Come on, don\'t be redicolous!', 'bad', `${cookies} cookies is a bit too much for someone in your league!`);
            resolve(false);
            return;
        }

        if (cookies > 5000) {
            repl(mes.channel, mes.author, args[1] + ' cookies is over the casino\'s maximum bet of 5000!', 'bad');
            resolve(false);
            return;
        }

        TudeApi.clubUserByDiscordId(mes.author.id, mes.author).then(u => {
            if (!u || u.error) {
                repl(mes.channel, mes.author, 'Couldn\'t fetch your userdata!', 'bad', 'That\'s not cool.');
                resolve(false);
                return;
            }
            if (cookies > u.cookies) {
                if (Math.random() < .05) {
                    // @ts-ignore
                    repl(mes.channel, mes.author, `${hidethepain} ${cookies} is more than you have`, 'bad', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png', banner: 'https://cdn.discordapp.com/emojis/655169782806609921.png' });
                } else {
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
                cookies = Math.min(5000, u.cookies);
            }
            if (cookies <= 0) {
                repl(mes.channel, mes.author, 'You cannot bet on 0 or less cookies!', 'bad');
                resolve(false);
                return;
            }

            if (currentGame.started) {
                if (!currentGame.allowNewBets) {
                    repl(mes.channel, mes.author, 'Please wait a moment, a game is still in progress!', 'bad');
                    resolve(false);
                    return;
                }
                for (let bet of currentGame.bets) {
                    if (bet.by.id == mes.author.id) {
                        repl(mes.channel, mes.author, 'You have already placed your bet on this game!', 'bad');
                        resolve(false);
                        return;
                    }
                }
                u.cookies -= cookies;
                TudeApi.updateClubUser(u);
                currentGame.bets.push({
                    by: mes.author,
                    clubuser: u,
                    on: wincondition,
                    ontext: wintext,
                    prizefactor: winfactor,
                    amount: cookies
                });
                currentGame.resolveIn = 5;
                if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.bets.length)
                    currentGame.resolveIn = 10;
                resolve(true);
            } else {
                currentGame.started = true;
                u.cookies -= cookies;
                TudeApi.updateClubUser(u);
                currentGame.bets.push({
                    by: mes.author,
                    clubuser: u,
                    on: wincondition,
                    ontext: wintext,
                    prizefactor: winfactor,
                    amount: cookies
                });
                currentGame.resolveIn = 2;
                if (bot.m.commands.getActiveInCommandsChannel().length > currentGame.bets.length)
                    currentGame.resolveIn = 10;
                resolve(true);
                mes.channel.send({ embed: {
                    color: 0x36393f,
                    title: 'Roulette',
                    description: 'Preparing...',
                }}).then(mes => currentGame.chatMessage = mes as Message).catch();
                currentGameTimer = setInterval(() => {
                    if (currentGame.resolveIn == 10 || currentGame.resolveIn == 5 || currentGame.resolveIn <= 2) {
                        if (currentGame.chatMessage)
                            currentGame.chatMessage.edit('', { embed: {
                                color: 0x36393f,
                                title: 'Roulette',
                                description: 'Starting in ' + currentGame.resolveIn + '```js\n'
                                    + currentGame.bets.map(b => `${b.by.username}: ${b.amount}c on ${b.ontext}`).join('\n')
                                    + '```',
                            }});
                    }
                    if (currentGame.resolveIn-- <= 0) {
                        currentGame.allowNewBets = false;
                        clearInterval(currentGameTimer);
                        resolveGame();
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

function resolveGame() {
    if (!currentGame.chatMessage) {
        resetGame();
        return;
    }

    currentGame.chatMessage.edit('', { embed: {
        color: 0x36393f,
        title: 'Roulette',
        description: 'Rolling...',
        thumbnail: {
            url: rollingImages[Math.floor(Math.random() * rollingImages.length)]
        }
    }});

    setTimeout(() => {
        let landedOn = Math.floor(Math.random() * 37);
        let desc = landedOn + ' • ' + getColor(landedOn) + ' • ' + (landedOn == 0 ? 'zero' : (landedOn % 2 == 0 ? 'even' : 'odd'));

        let gnome = false;
        if (Math.random() < 0.001) { // 0.1%
            gnome = true;
            landedOn = -1;
            desc = '(Everyone wins)';
        }

        desc += '```js\n';
        for (let b of currentGame.bets) {
            let won = gnome || b.on({ number: landedOn, color: getColor(landedOn) });
            let prize = b.amount;
            if (won) { 
                b.clubuser.cookies += prize + prize * b.prizefactor;
                TudeApi.updateClubUser(b.clubuser);
                prize *= b.prizefactor;
            }
            desc += `${b.by.username} (${b.ontext}): ${(won ? '+' : '-') + prize}c • ${b.clubuser.cookies}c total\n`;
        }
        desc += '```';
        let color = getColor(landedOn) == 'red' ? 0xFE1B40 : 0x181A1C;
        if (landedOn == 0) color = 0x4DC88A;
        currentGame.chatMessage.edit('', { embed: {
            color: color,
            title: gnome ? 'You\'ve been gnomed!' : 'Roulette',
            description: desc,
            thumbnail: {
                url: gnome ? gnomeImage : images[landedOn]
            }
        }});
        setTimeout(resetGame, 2000);
    }, 2000 + Math.floor(Math.random() * 4000));
}

function resetGame() {
    currentGame = {
        bets: [],
        allowNewBets: true,
        started: false,
        resolveIn: 0,
        chatMessage: null as Message
    }   
}

function getColor(number: number): string {
    if (number == 0) return 'green';
    if ([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].indexOf(number) >= 0) return 'black';
    return 'red';
}