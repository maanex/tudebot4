"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const parseArgs_1 = require("../util/parseArgs");
const types_1 = require("../types");
const AsciiTable = require('ascii-table');
class InventoryCommand extends types_1.Command {
    constructor(lang) {
        super('inventory', ['inv',
            'items',
            'i'], 'See your inventory (or someone elses)', 0, false, false, lang);
    }
    execute(channel, orgUser, args, event, repl) {
        return new Promise((resolve, reject) => {
            let cmdl = parseArgs_1.default.parse(args);
            let user = orgUser;
            if (event.message.mentions.users.size)
                user = event.message.mentions.users.first();
            tudeapi_1.default.clubUserByDiscordId(user.id, user)
                .then(u => {
                if (!u || u.error) {
                    repl('User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }
                if (!u.inventory || !u.inventory.size) {
                    let wow = Math.random() < .1;
                    channel.send({
                        embed: {
                            author: {
                                name: `${user.username}'s inventory:`,
                                icon_url: user.avatarURL
                            },
                            color: 0x2f3136,
                            description: wow ? 'Wow, such empty' : '... *Empty*',
                            image: wow ? { url: 'https://cdn.discordapp.com/attachments/655354019631333397/666720051784581155/unknown.png' } : undefined,
                            footer: wow ? { text: 'This inventory is empty' } : undefined
                        }
                    });
                    resolve(false);
                    return;
                }
                const fields = {};
                for (let i of u.inventory.values()) {
                    if (fields[i.prefab.category.id])
                        fields[i.prefab.category.id].push(i);
                    else
                        fields[i.prefab.category.id] = [i];
                }
                if (cmdl.t || cmdl.table) {
                    let table = new AsciiTable();
                    table.setHeading('type', 'amount', 'category', 'type', 'id');
                    let from = 1; // start counting with 1 here, I know it's unconventional but whatever it needs(!) to be done
                    let to = 10;
                    if (cmdl.p || cmdl.page) {
                        from = parseInt(cmdl.p == undefined ? cmdl.page : cmdl.p) * 10 - 9;
                        to = from + 9;
                    }
                    let c = 0;
                    for (let i of u.inventory.values()) {
                        if (++c >= from && c <= to)
                            table.addRow(i.prefab.id, i.amount, i.prefab.category.id, i.prefab.group.id, i.id);
                    }
                    channel.send('```\n' + table.toString() + `\nShowing ${from} - ${to} out of ${u.inventory.size}` + '```');
                }
                else {
                    channel.send({
                        embed: {
                            author: {
                                name: `${user.username}'s inventory:`,
                                icon_url: user.avatarURL
                            },
                            color: 0x2f3136,
                            fields: Object.values(fields).map(v => {
                                return {
                                    // name: v.length == 1 ? v[0].category.name : v[0].category.namepl,
                                    name: v[0].prefab.category.namepl || 'Unknown',
                                    value: v.map(i => `${i.prefab.icon} \`${i.amount == 1 ? '' : i.amount + 'x '}${i.name}\` (${i.id})`).join('\n')
                                };
                            })
                        }
                    });
                }
                resolve(true);
            })
                .catch(err => {
                repl('An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
}
exports.default = InventoryCommand;
//# sourceMappingURL=inventory.js.map