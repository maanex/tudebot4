import { User, TextChannel } from 'discord.js'
import axios from 'axios'
import ParseArgs from '../util/parse-args'
import { Command, CommandExecEvent, ReplyFunction } from '../types/types'


export default class CocktailCommand extends Command {

  constructor() {
    super({
      name: 'cocktail',
      aliases: [ 'cocktails', 'drink', 'makemeadrink', 'schwanzschwanz', 'mix' ],
      description: 'A random cocktail recipe',
      groups: [ 'fun', 'apiwrapper' ]
    })
  }

  public async execute(channel: TextChannel, user: User, args: string[], _event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    const cmdl = ParseArgs.parse(args)
    let url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php'
    let search = ''
    if (cmdl._) {
      search = cmdl._ + ''
      url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(search)
    }
    try {
      const { data: o } = await axios.get(url)
      if (!o || !o.drinks || !o.drinks.length) {
        if (search) repl(`Haven't found any cocktails that go by the name ${search}!`, 'bad')
        else repl('Couldn\'t load the cocktail list!', 'bad', 'Maybe just get yourself a glass of water or something.')
        return false
      }
      const drink = o.drinks[0]

      if (cmdl.r || cmdl.raw) {
        repl('```json\n' + JSON.stringify(drink, null, 2) + '```')
        return false
      }

      const ingredients = []
      let i = 1
      while (drink['strIngredient' + i]) {
        ingredients.push(`${drink['strMeasure' + i]} **${drink['strIngredient' + i]}**`)
        i++
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
      })
      return true
    } catch (e) {
      repl('An error occured!', 'bad')
      return false
    }
  }

}
