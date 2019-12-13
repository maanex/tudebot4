import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";

const fetch = require('node-fetch');



const hidethepain = '<:hidethepain:655169782806609921>';

interface Digit {
    number: number;
    color: string;
}

module.exports = {

    name: 'roulette',
    aliases: [
        'r'
    ],
    desc: 'Sweet game of Roulette',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void) {
        
        if (args.length < 2) {
            repl(mes.channel, mes.author, 'roulette <bet> <amount>', 'bad', 'bet on: red, black, green, odd, even, 0 - 36');
            return;
        }

        let wincondition: (digit: Digit) => boolean = null;
        let wintext: String = '';

        switch (args[0].toLowerCase()) {
            case 'r':
            case 'red':
                wincondition = d => d.color == 'red';
                wintext = 'red';
                break;
                
            case 'black':
            case 'black':
                wincondition = d => d.color == 'black';
                wintext = 'black';
                break;
                
            case 'even':
            case 'e':
                wincondition = d => d.number % 2 == 0;
                wintext = 'even';
                break;
                
            case 'odd':
            case 'o':
                wincondition = d => d.number % 2 == 1;
                wintext = 'odd';
                break;

            case 'g':
                args[0] = '0';
            default:
                if (isNaN(parseInt(args[0]))) break;
                if (parseInt(args[0]) < 0 || parseInt(args[0]) > 36) break;
                wincondition = d => d.number == parseInt(args[0]);
                wintext = args[0];
        }

        if (!wincondition) {
            repl(mes.channel, mes.author, args[0] + ' is not a valid bet!')
            return;
        }

        let cookies = args[1] == 'a' ? -42 : parseInt(args[1]);
        if (isNaN(cookies)) {
            repl(mes.channel, mes.author, args[1] + ' is not a valid amount of cookies!')
            return;
        }

        if (cookies > Math.random() * 1_000_000 + 100_000) {
            repl(mes.channel, mes.author, 'Come on, don\'t be redicolous!', 'message', `${cookies} cookies is a bit too much for someone in your league!`);
            return;
        }

        if (cookies > 5000) {
            repl(mes.channel, mes.author, args[1] + ' cookies is over the casino\'s maximum bet of 5000!');
            return;
        }

        TudeApi.clubUserByDiscordId(mes.author.id).then(u => {
            if (!u || u.error) {
                repl(mes.channel, mes.author, 'An error occured!', 'error')
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

                return;
            }
            if (cookies == -42)
                cookies = Math.min(5000, u.cookies);
            if (cookies <= 0) {
                repl(mes.channel, mes.author, 'You cannot bet on 0 or less cookies!');
                return;
            }

            
        }).catch(err => repl(mes.channel, mes.author, 'An error occured!', 'error'));

    }

}