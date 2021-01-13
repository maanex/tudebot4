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
class InspirationCommand extends types_1.Command {
    constructor() {
        super({
            name: 'inspiration',
            aliases: ['inspirational', 'inspirobot', 'randomquote', 'thinkaboutit'],
            description: 'Random quote from inspirobot.me',
            groups: ['fun', 'apiwrapper']
        });
    }
    execute(channel, user, _args, _event, _repl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: o } = yield axios_1.default.get('http://inspirobot.me/api?generate=true');
                channel.send({
                    embed: {
                        color: 0x2F3136,
                        image: {
                            url: o
                        },
                        footer: {
                            text: `${user.username} • inspirobot.me`,
                            icon_url: user.avatarURL()
                        }
                    }
                });
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.default = InspirationCommand;
//# sourceMappingURL=inspiration.js.map