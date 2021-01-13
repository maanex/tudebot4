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
const axios_1 = require("axios");
const parse_args_1 = require("../util/parse-args");
const types_1 = require("../types/types");
class CocktailCommand extends types_1.Command {
    constructor() {
        super({
            name: 'cocktail',
            aliases: ['cocktails', 'drink', 'makemeadrink', 'schwanzschwanz', 'mix'],
            description: 'A random cocktail recipe',
            groups: ['fun', 'apiwrapper']
        });
    }
    execute(channel, user, args, _event, repl) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmdl = parse_args_1.default.parse(args);
            let url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php';
            let search = '';
            if (cmdl._) {
                search = cmdl._ + '';
                url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search);
            }
            try {
                const { data: o } = yield axios_1.default.get(url);
                if (!o || !o.drinks || !o.drinks.length) {
                    if (search)
                        repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
                    else
                        repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
                    return false;
                }
                const drink = o.drinks[0];
                if (cmdl.r || cmdl.raw) {
                    repl('```json\n' + JSON.stringify(drink, null, 2) + '```');
                    return false;
                }
                const ingredients = [];
                let i = 1;
                while (drink['strIngredient' + i]) {
                    ingredients.push(`${drink['strMeasure' + i]} **${drink['strIngredient' + i]}**`);
                    i++;
                }
                channel.send({
                    embed: {
                        color: 0x2F3136,
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
                            icon_url: user.avatarURL()
                        }
                    }
                });
                return true;
            }
            catch (e) {
                repl('An error occured!', 'bad');
                return false;
            }
        });
    }
}
exports.default = CocktailCommand;
//# sourceMappingURL=cocktail.js.map