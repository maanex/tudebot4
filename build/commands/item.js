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
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const types_1 = require("../types/types");
const parse_args_1 = require("../util/parse-args");
class ItemCommand extends types_1.Command {
    constructor() {
        super({
            name: 'item',
            description: 'View an item in your inventory',
            groups: ['club'],
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            if (!args[0]) {
                repl('What item are you looking for?', 'bad', 'Type `item <name>` and replace <name> with the item\'s name!');
                return false;
            }
            let cmdl = parse_args_1.default.parse(args);
            tudeapi_1.default.clubUserByDiscordId(user.id, user).then((u) => __awaiter(this, void 0, void 0, function* () {
                if (!u || u.error) {
                    repl('An error occured!', 'error');
                    return false;
                }
                if (!u.inventory.has(args[0])) {
                    repl(`You don't appear to have **${args[0]}** in your inventory!`, 'bad');
                    return false;
                }
                const item = u.inventory.get(args[0]);
                channel.send({ embed: {
                        title: `${item.prefab.icon} ${item.prefab.expanded ? '' : `**${item.amount}x** `}${item.name}`,
                        description: `\`${item.id}\`\n${item.description}`,
                        fields: yield item.renderMetadata(),
                        color: 0x2f3136,
                        footer: { text: `@${user.tag}` }
                    } });
                return true;
            })).catch(console.error);
        });
    }
}
exports.default = ItemCommand;
//# sourceMappingURL=item.js.map