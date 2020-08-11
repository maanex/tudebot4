import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import ParseArgs from "../util/parseArgs";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types/types";
import Emojis from "../int/emojis";

const fetch = require('node-fetch');


export default class TriviaCommand extends Command {

  constructor() {
    super({
      name: 'trivia',
      aliases: [ 'quiz', 'quizz', 'question' ],
      description: 'Trivia time!',
      cooldown: 10,
      groups: [ 'fun', 'apiwrapper' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    let cmdl = ParseArgs.parse(args);
    let url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986';
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.json())
        .then(o => {
          const res = o.results[0];
          let options = [];

          options.push(res.correct_answer);
          options.push(...res.incorrect_answers);

          options = options.sort(() => Math.random()-.5).map(decodeURIComponent);
          let correct = options.indexOf(decodeURIComponent(res.correct_answer));

          channel.send({
            embed: {
              color: 0x2f3136,
              title: 'Trivia time!',
              fields: [
                {
                  name: `${decodeURIComponent(res.category)} • ${res.difficulty}`,
                  value: `${Emojis.BIG_SPACE}\n**${decodeURIComponent(res.question)}**\n🇦 ${options[0]}\n🇧 ${options[1]}\n🇨 ${options[2]}\n🇩 ${options[3]}\n\nCorrect answer: ||${(['🇦','🇧','🇨','🇩'])[correct]}||`
                }
              ],
              footer: {
                text: '@' + user.username + ' • powered by opentdb.com'
              }
            }
          });
          resolve(true);
        })
        .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false) });
    });
  }

}
