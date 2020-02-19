import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge, Item } from "../thirdparty/tudeapi/tudeapi";
import ParseArgs from "../util/parseArgs";

const AsciiTable = require('ascii-table')
const fetch = require('node-fetch');


const _bigspace = '<:nothing:409254826938204171>';

module.exports = {

    name: 'inventory',
    aliases: [
        'inv',
        'items',
        'i'
    ],
    desc: 'See your inventory (or someone elses)',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let cmdl = ParseArgs.parse(args);
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();
        TudeApi.clubUserByDiscordId(user.id, user)
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }

                if (!u.inventory || !u.inventory.size) {
                    let wow = Math.random() < .1;
                    mes.channel.send({ embed: {
                        author: {
                            name: `${user.username}'s inventory:`,
                            icon_url: user.avatarURL
                        },
                        color: 0x2f3136,
                        description: wow ? 'Wow, such empty' : '... *Empty*',
                        image: wow ? { url: 'https://cdn.discordapp.com/attachments/655354019631333397/666720051784581155/unknown.png' } : undefined,
                        footer: wow ? { text: 'This inventory is empty' } : undefined
                    }});
                    resolve(false);
                    return;
                }
                
                let fields: {[cat: string]: Item[]} = { };

                for (let i of u.inventory.values()) {
                    if (fields[i.category.id]) fields[i.category.id].push(i);
                    else fields[i.category.id] = [i];
                }
                
                if (cmdl.t || cmdl.table) {
                    var table = new AsciiTable();
                    table.setHeading('id', 'amount', 'category', 'type', 'ref');
                    let from = 1; // start counting with 1 here, I know it's unconventional but whatever it needs(!) to be done
                    let to = 10;
                    if (cmdl.p || cmdl.page) {
                        from = parseInt(cmdl.p == undefined ? (cmdl.page as string) : (cmdl.p as string)) * 10 - 9;
                        to = from + 9;
                    }
                    let c = 0;
                    for (let i of u.inventory.values()) {
                        if (++c >= from && c <= to)
                            table.addRow(i.id, i.amount, i.category.id, i.type.id, i.ref);
                    }
                    mes.channel.send('```\n' + table.toString() + `\nShowing ${from} - ${to} out of ${u.inventory.size}` + '```');
                } else {
                    mes.channel.send({
                        embed: {
                            author: {
                                name: `${user.username}'s inventory:`,
                                icon_url: user.avatarURL
                            },
                            color: 0x2f3136,
                            fields: Object.values(fields).map(v => { return {
                                // name: v.length == 1 ? v[0].category.name : v[0].category.namepl,
                                name: v[0].category.namepl || 'Unknown',
                                value: v.map(i => `${i.icon} \`${i.amount == 1 ? '' : i.amount + 'x '}${i.name}\` (${i.ref})`).join('\n')
                            }})
                        }
                    });   
                }
                resolve(true);
            })
            .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
                resolve(false);
            })
    });
    }

}