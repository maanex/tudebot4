"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseArgs_1 = require("../util/parseArgs");
const types_1 = require("../types");
const fetch = require('node-fetch');
class MealCommand extends types_1.Command {
    constructor(lang) {
        super('meal', ['food',
            'whatshallieat',
            'makemefood',
            'eat'], 'A random meal and how to make it', 2, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        let cmdl = parseArgs_1.default.parse(args);
        let url = 'https://www.themealdb.com/api/json/v1/1/random.php';
        let search = '';
        if (cmdl._) {
            search = cmdl._ + '';
            url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search);
        }
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(o => o.json())
                .then(o => {
                if (!o || !o.meals || !o.meals.length) {
                    console.log(url);
                    if (search)
                        repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
                    else
                        repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
                    reject();
                    return;
                }
                let meal = o.meals[0];
                if (cmdl.r || cmdl.raw) {
                    repl('```json\n' + JSON.stringify(meal, null, 2) + '```');
                    reject();
                    return;
                }
                let ingredients = [];
                let i = 1;
                while (meal['strIngredient' + i]) {
                    ingredients.push(`${meal['strMeasure' + i]} **${meal['strIngredient' + i]}**`);
                    i++;
                }
                channel.send({
                    embed: {
                        color: 0x2f3136,
                        title: meal.strMeal,
                        thumbnail: {
                            url: meal.strMealThumb
                        },
                        fields: [
                            {
                                name: 'Category',
                                value: meal.strCategory,
                                inline: true
                            },
                            {
                                name: 'Area',
                                value: meal.strArea,
                                inline: true
                            },
                            {
                                name: 'Ingredients',
                                value: ingredients.join('\n')
                            },
                            {
                                name: 'Instructions',
                                value: meal.strInstructions
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
exports.default = MealCommand;
//# sourceMappingURL=meal.js.map