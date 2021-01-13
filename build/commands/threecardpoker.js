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
const types_1 = require("../types/types");
class ThreeCardPokerCommand extends types_1.Command {
    constructor() {
        super({
            name: 'threecardpoker',
            aliases: ['tcp', '3cp'],
            description: 'Three card poker. Arguments: <ante> <pairplus?>',
            cooldown: 5,
            groups: ['club', 'casino']
        });
        this.raise = '✅';
        this.fold = '⏸️';
        this.hearts = '<:hearts:661657523878625295>';
        this.diamonds = '<:diamonds:661657523820036106>';
        this.spades = '<:spades:661657523333496854>';
        this.clubs = '<:clubs:661657523756990524>';
        this.cvalues = {
            black: [
                '<:b2:661659488872300584>',
                '<:b3:661659488562184195>',
                '<:b4:661659488847134720>',
                '<:b5:661659488897728522>',
                '<:b6:661659488947929098>',
                '<:b7:661659488528367655>',
                '<:b8:661659488821968981>',
                '<:b9:661659488595738675>',
                '<:bJ:661659488750927902>',
                '<:bQ:661659488872562718>',
                '<:bK:661659488863911936>',
                '<:bA:661659488411058180>'
            ],
            red: [
                '<:r2:661660240168878100>',
                '<:r3:661660240198238208>',
                '<:r4:661660239757836291>',
                '<:r5:661660240160358418>',
                '<:r6:661660240231661578>',
                '<:r7:661660240235855912>',
                '<:r8:661660240093380626>',
                '<:r9:661660240382525466>',
                '<:rJ:661660239929671741>',
                '<:rQ:661660240252633105>',
                '<:rK:661660240227467264>',
                '<:rA:661660239975809085>'
            ]
        };
        this.currentGame = {
            entries: [],
            dealer: [],
            dealerFold: false,
            allowNewEntries: true,
            started: false,
            startIn: 0,
            chatMessage: null,
            deck: []
        };
        this.currentGameTimer = null;
    }
    execute(channel, user, args, _event, repl) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
}
exports.default = ThreeCardPokerCommand;
//# sourceMappingURL=threecardpoker.js.map