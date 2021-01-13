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
class CatCommand extends types_1.Command {
    constructor() {
        super({
            name: 'cat',
            aliases: ['kitten', 'catimage', 'catimg', 'pussy'],
            description: 'A random cat image',
            groups: ['fun', 'images', 'apiwrapper']
        });
    }
    execute(channel, user, _args, _event, repl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: o } = yield axios_1.default.get('https://api.thecatapi.com/v1/images/search?format=json');
                channel.send({
                    embed: {
                        color: 0x2F3136,
                        image: {
                            url: o[0].url
                        },
                        footer: {
                            text: user.username,
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
exports.default = CatCommand;
//# sourceMappingURL=catimg.js.map