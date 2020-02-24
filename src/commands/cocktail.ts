import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import ParseArgs from "../util/parseArgs";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class CocktailCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'cocktail',
      [ 'cocktails',
        'drink',
        'makemeadrink',
        'schwanzschwanz',
        'mix' ],
      'A random cocktail recipe',
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    const cmdl = ParseArgs.parse(args);
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
            console.log(url)
            if (search) repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
            else repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
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
        .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
