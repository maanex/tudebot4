"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseArgs_1 = require("../util/parseArgs");
const types_1 = require("../types");
const fetch = require('node-fetch');
class CocktailCommand extends types_1.Command {
    constructor(lang) {
        super('cocktail', ['cocktails',
            'drink',
            'makemeadrink',
            'schwanzschwanz',
            'mix'], 'A random cocktail recipe', 0, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        const cmdl = parseArgs_1.default.parse(args);
        let url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
        let search = '';
        if (cmdl._) {
            search = cmdl._ + '';
            url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search);
        }
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(o => o.json())
                .then(o => {
                if (!o || !o.drinks || !o.drinks.length) {
                    console.log(url);
                    if (search)
                        repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
                    else
                        repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
                    reject();
                    return;
                }
                const drink = o.drinks[0];
                if (cmdl.r || cmdl.raw) {
                    repl('```json\n' + JSON.stringify(drink, null, 2) + '```');
                    reject();
                    return;
                }
                let ingredients = [];
                let i = 1;
                while (drink['strIngredient' + i]) {
                    ingredients.push(`${drink['strMeasure' + i]} **${drink['strIngredient' + i]}**`);
                    i++;
                }
                channel.send({
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
                            text: user.username + ' • powered by thecocktaildb.com',
                            icon_url: user.avatarURL
                        }
                    }
                });
                resolve(true);
            })
                .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = CocktailCommand;
//# sourceMappingURL=cocktail.js.map