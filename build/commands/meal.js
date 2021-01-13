"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse_args_1 = require("../util/parse-args");
const types_1 = require("../types/types");
const fetch = require('node-fetch');
class MealCommand extends types_1.Command {
    constructor() {
        super({
            name: 'meal',
            aliases: ['food', 'whatshallieat', 'makemefood', 'eat'],
            description: 'A random meal and how to make it',
            cooldown: 2,
            groups: ['fun', 'apiwrapper']
        });
    }
    execute(channel, user, args, _event, repl) {
        const cmdl = parse_args_1.default.parse(args);
        let url = 'https://www.themealdb.com/api/json/v1/1/random.php';
        let search = '';
        if (cmdl._) {
            search = cmdl._ + '';
            url = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search);
        }
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(o => o.json())
                .then((o) => {
                if (!o || !o.meals || !o.meals.length) {
                    if (search)
                        repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
                    else
                        repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
                    reject();
                    return;
                }
                const meal = o.meals[0];
                if (cmdl.r || cmdl.raw) {
                    repl('```json\n' + JSON.stringify(meal, null, 2) + '```');
                    reject();
                    return;
                }
                const ingredients = [];
                let i = 1;
                while (meal['strIngredient' + i]) {
                    ingredients.push(`${meal['strMeasure' + i]} **${meal['strIngredient' + i]}**`);
                    i++;
                }
                channel.send({
                    embed: {
                        color: 0x2F3136,
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
                                value: ingredients.join('\n').substr(0, 1024)
                            },
                            {
                                name: 'Instructions',
                                value: meal.strInstructions.substr(0, 1024)
                            }
                        ],
                        footer: {
                            text: '@' + user.username + ' • powered by thecocktaildb.com'
                        }
                    }
                });
                resolve(true);
            })
                .catch((err) => { console.error(err); repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = MealCommand;
//# sourceMappingURL=meal.js.map