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
const types_1 = require("../types");
const itemlist_1 = require("../content/itemlist");
const parseArgs_1 = require("../util/parseArgs");
class UseCommand extends types_1.Command {
    constructor() {
        super({
            name: 'use',
            aliases: ['u'],
            description: 'Use an item in your inventory',
            groups: ['club'],
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => {
            if (!args[0]) {
                repl('What item do you want to use?', 'bad', 'Type `use <name>` and replace <name> with the item\'s name!');
                return false;
            }
            let cmdl = parseArgs_1.default.parse(args);
            tudeapi_1.default.clubUserByDiscordId(user.id, user).then((u) => __awaiter(this, void 0, void 0, function* () {
                if (!u || u.error) {
                    repl('An error occured!', 'error');
                    return false;
                }
                if (!u.inventory.has(args[0])) {
                    const item = itemlist_1.findItem(args[0]);
                    if (item) {
                        if (item.expanded && Array.from(u.inventory.keys()).includes(item.id)) {
                            repl(`You have multiple ${tudeapi_1.default.clubLang['itempl_' + item.id]} in your inventory!`, 'bad', 'Please give me the exact id of the item you wanna use!');
                        }
                        else {
                            repl(`You don't appear to have **${args[0]}** in your inventory!`, 'bad');
                        }
                    }
                    else {
                        repl(`I don't know what a **"${args[0]}"** should be...`, 'bad');
                    }
                    return false;
                }
                const item = u.inventory.get(args[0]);
                if (item.prefab.useable) {
                    item.use(event.message, repl, u);
                    return true;
                }
                else {
                    repl('You cannot use this item!', 'bad');
                    return false;
                }
            })).catch(console.error);
        });
    }
}
exports.default = UseCommand;
//# sourceMappingURL=use.js.map