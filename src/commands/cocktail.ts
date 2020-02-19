import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import ParseArgs from "../util/parseArgs";

const fetch = require('node-fetch');


module.exports = {

    name: 'cocktail',
    aliases: [
        'cocktails',
        'drink',
        'makemeadrink',
        'schwanzschwanz',
        'mix'
    ],
    desc: 'A random cocktail recipe',
    sudoonly: false,


    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void): Promise<boolean> {
        let cmdl = ParseArgs.parse(args);
        return new Promise((resolve, reject) => {
            fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
                .then(o => o.json())
                .then(o => {
                    let drink = o.drinks[0];

                    if (cmdl.r || cmdl.raw) {
                        repl(mes.channel, mes.author, '```json\n' + JSON.stringify(drink, null, 2) + '```');
                        return;
                    }

                    let ingredients = [];
                    let i = 1;
                    while (drink['strIngredient' + i]) {
                        ingredients.push(`${drink['strMeasure'+i]} **${drink['strIngredient'+i]}**`);
                        i++;
                    }
                    mes.channel.send({
                        embed: {
                            color: 0x2f3136,
                            title: drink.strDrink,
                            thumbnail: {
                                url: drink.strDrinkThumb
                            },
                            fields: [
                                {
                                    name: 'Category',
                                    value: drink.strCategory,
                                    inline: true
                                },
                                {
                                    name: 'Glass',
                                    value: drink.strGlass,
                                    inline: true
                                },
                                {
                                    name: 'Alcoholic?',
                                    value: drink.strAlcoholic,
                                    inline: true
                                },
                                {
                                    name: 'Ingredients',
                                    value: ingredients.join('\n')
                                },
                                {
                                    name: 'Instructions',
                                    value: drink.strInstructions
                                }
                            ],
                            footer: {
                                text: mes.author.username + ' • powered by thecocktaildb.com',
                                icon_url: mes.author.avatarURL
                            }
                        }
                    }) && resolve(true)
                })
                .catch(err => { repl(mes.channel, mes.author, 'An error occured!', 'bad'); resolve(false) });
        });
    }

}