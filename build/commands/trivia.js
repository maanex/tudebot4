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
const types_1 = require("../types/types");
const emojis_1 = require("../int/emojis");
class TriviaCommand extends types_1.Command {
    constructor() {
        super({
            name: 'trivia',
            aliases: ['quiz', 'quizz', 'question'],
            description: 'Trivia time!',
            cooldown: 10,
            groups: ['fun', 'apiwrapper']
        });
    }
    execute(channel, user, _args, _event, repl) {
        return __awaiter(this, void 0, void 0, function* () {
            // const cmdl = ParseArgs.parse(args)
            const url = 'https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986';
            try {
                const { data } = yield axios_1.default.get(url);
                const res = data.results[0];
                let options = [];
                options.push(res.correct_answer);
                options.push(...res.incorrect_answers);
                options = options.sort(() => Math.random() - 0.5).map(decodeURIComponent);
                const correct = options.indexOf(decodeURIComponent(res.correct_answer));
                channel.send({
                    embed: {
                        color: 0x2F3136,
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
                return true;
            }
            catch (err) {
                console.error(err);
                repl('An error occured!', 'bad');
                return false;
            }
        });
    }
}
exports.default = TriviaCommand;
//# sourceMappingURL=trivia.js.map