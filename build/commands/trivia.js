"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseArgs_1 = require("../util/parseArgs");
const types_1 = require("../types");
const emojis_1 = require("../int/emojis");
const fetch = require('node-fetch');
class TriviaCommand extends types_1.Command {
    constructor(lang) {
        super('trivia', ['quiz',
            'quizz',
            'question'], 'Trivia time!', 10, false, false, lang);
    }
    execute(channel, user, args, event, repl) {
        let cmdl = parseArgs_1.default.parse(args);
        let url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986';
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => res.json())
                .then(o => {
                const res = o.results[0];
                let options = [];
                options.push(res.correct_answer);
                options.push(...res.incorrect_answers);
                options = options.sort(() => Math.random() - .5).map(decodeURIComponent);
                let correct = options.indexOf(decodeURIComponent(res.correct_answer));
                channel.send({
                    embed: {
                        color: 0x2f3136,
                        title: 'Trivia time!',
                        fields: [
                            {
                                name: `${decodeURIComponent(res.category)} • ${res.difficulty}`,
                                value: `${emojis_1.default.BIG_SPACE}\n**${decodeURIComponent(res.question)}**\n🇦 ${options[0]}\n🇧 ${options[1]}\n🇨 ${options[2]}\n🇩 ${options[3]}\n\nCorrect answer: ||${(['🇦', '🇧', '🇨', '🇩'])[correct]}||`
                            }
                        ],
                        footer: {
                            text: '@' + user.username + ' • powered by opentdb.com'
                        }
                    }
                });
                resolve(true);
            })
                .catch(err => { console.error(err); repl('An error occured!', 'bad'); resolve(false); });
        });
    }
}
exports.default = TriviaCommand;
//# sourceMappingURL=trivia.js.map