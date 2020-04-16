import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import ParseArgs from "../util/parseArgs";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";

const fetch = require('node-fetch');


export default class MealCommand extends Command {

  constructor() {
    super({
      name: 'meal',
      aliases: [ 'food', 'whatshallieat', 'makemefood', 'eat' ],
      description: 'A random meal and how to make it',
      cooldown: 2,
      groups: [ 'fun', 'apiwrapper' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    let cmdl = ParseArgs.parse(args);
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
            if (search) repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad');
            else repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.');
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
        .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
