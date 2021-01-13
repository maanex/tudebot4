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
const discord_js_1 = require("discord.js");
const types_1 = require("../types/types");
const index_1 = require("../index");
class WantedCommand extends types_1.Command {
    constructor() {
        super({
            name: 'wanted',
            description: 'I want you',
            groups: ['fun', 'images']
        });
    }
    execute(channel, user, _args, event, _repl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.message.mentions.members.size)
                user = event.message.mentions.members.first().user;
            try {
                const imgBuffer = yield index_1.TudeBot.badoszApi.getWanted(user.avatarURL());
                const file = new discord_js_1.MessageAttachment(imgBuffer, 'wanted.png'); // FIXME
                const embed = new discord_js_1.MessageEmbed()
                    .attachFiles([file])
                    .setColor(0x2F3136)
                    .setFooter(`@${user.tag} • api.badosz.com`)
                    .setImage('attachment://wanted.png');
                channel.send('', { embed });
                return true;
            }
            catch (ex) {
                return false;
            }
        });
    }
}
exports.default = WantedCommand;
//# sourceMappingURL=wanted.js.map