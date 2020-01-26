"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const parseArgs_1 = require("../util/parseArgs");
const fetch = require('node-fetch');
module.exports = {
    name: 'give',
    aliases: [
        'g',
        'send',
        'trade',
        'transaction',
        'transcribe',
        'transfer',
        'yowtfjustgivethisdudewhatheneedsboi',
        'wtfevenisthisbullshietherelikeforfookssakewhyaretheresoweirdcommandaliaseslikethisonewhyyyyy',
    ],
    desc: 'Transfer items or cookies to other players',
    sudoonly: false,
    execute(bot, mes, sudo, args, repl) {
        return new Promise((resolve, reject) => {
            let cmdl = parseArgs_1.default.parse(args);
            tudeapi_1.default.clubUserByDiscordId(mes.author.id, mes.author)
                .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'Couldn\'t fetch your userdata!', 'message', 'That\'s not cool.');
                    resolve(false);
                    return;
                }
                if (args.length < 2) {
                    repl(mes.channel, mes.author, 'give <@someone> <amount> [itemname]', 'bad', 'Don\'t provide an item name in order to send them your cookies');
                    resolve(false);
                    return;
                }
                let otherPerson = mes.mentions.users.first();
                if (!otherPerson) {
                    repl(mes.channel, mes.author, `Who tf is ${args[0]}?`, 'bad');
                    resolve(false);
                    return;
                }
                if (otherPerson.bot) {
                    repl(mes.channel, mes.author, 'Nah he no wants ya garbage, boy!', 'bad', `aka ${otherPerson.username} is a bot and they can't recieve items`);
                    resolve(false);
                    return;
                }
                if (otherPerson.id === mes.author.id) {
                    mes.channel.send({ embed: {
                            color: 0x36393f,
                            image: { url: 'https://cdn.discordapp.com/attachments/655354019631333397/669183258679967744/34yx3j.png' },
                            footer: { text: `@${mes.author.username}` }
                        } });
                    resolve(false);
                    return;
                }
                let force = cmdl.f || cmdl.force;
                let swap = !(args[1].toLowerCase() == 'a' || args[1].toLowerCase() == 'all' || !isNaN(parseInt(args[1])));
                let amount = 1;
                if (!swap || args.length > 2) {
                    amount = parseInt(args[swap ? 2 : 1]);
                    if (args[swap ? 2 : 1].toLowerCase() == 'a' || args[swap ? 2 : 1].toLowerCase() == 'all')
                        amount = -42;
                    else if (!force && (!amount || isNaN(amount) || amount <= 0)) {
                        repl(mes.channel, mes.author, `${args[swap ? 2 : 1]} is not a valid amount`, 'bad');
                        resolve(false);
                        return;
                    }
                }
                let type = 'cookie';
                let dispName = 'cookies';
                if (args.length > 2 || swap) {
                    let name = args[swap ? 1 : 2];
                    let item = tudeapi_1.default.items.find(i => i.id == name.toLowerCase());
                    dispName = item.name;
                    if (!force) {
                        let iitem = u.inventory.get(name.toLowerCase());
                        if (!item && iitem)
                            item = tudeapi_1.default.items.find(i => i.id == iitem.id);
                        if (!item) {
                            if (swap)
                                repl(mes.channel, mes.author, `${args[1]} is an invalid amount of cookies.`, 'bad');
                            else
                                repl(mes.channel, mes.author, `Item ${args[1]} not found!`, 'bad');
                            resolve(false);
                            return;
                        }
                        if (!item.tradeable) {
                            repl(mes.channel, mes.author, `This item is not tradeable!`, 'bad');
                            resolve(false);
                            return;
                        }
                        if (!iitem || !iitem.amount) {
                            if (item.expanded)
                                repl(mes.channel, mes.author, `You have to specify which one, e.g. \`${item.id}1\`!`, 'bad');
                            else
                                repl(mes.channel, mes.author, `You don't have any ${item.name}!`, 'bad');
                            resolve(false);
                            return;
                        }
                        if (amount == -42)
                            amount = iitem.amount;
                        if (iitem.amount < amount) {
                            repl(mes.channel, mes.author, `You only have ${iitem.amount} ${item.name}${iitem.amount == 1 ? '' : 's'}!`, 'bad');
                            resolve(false);
                            return;
                        }
                    }
                    type = name;
                }
                else {
                    if (amount == -42)
                        amount = u.cookies;
                    if (amount > u.cookies) {
                        repl(mes.channel, mes.author, `You only have ${u.cookies} cookie${u.cookies == 1 ? '' : 's'}!`, 'bad');
                        resolve(false);
                        return;
                    }
                    if (amount == 1)
                        dispName = 'cookie';
                }
                tudeapi_1.default.clubUserByDiscordId(otherPerson.id, otherPerson).then(rec => {
                    tudeapi_1.default.performClubUserAction(u, { id: 'transaction', amount: amount, type: type, reciever: rec.id }).then(o => {
                        mes.channel.send({
                            embed: {
                                color: 0x4DC88A,
                                title: `Transaction completed.`,
                                description: `${otherPerson.username} recieved **${amount} ${dispName}** from ${mes.author.username}.`,
                                footer: { text: `@${mes.author.username}` }
                            }
                        });
                        if (!bot.m.commands.getActiveInCommandsChannel().includes(otherPerson.id)) {
                            otherPerson.send({ embed: {
                                    color: 0x4DC88A,
                                    title: `UwU a gift`,
                                    description: `${mes.author.username} sent you **${amount} ${dispName}**. Time to party.`,
                                    footer: { text: `I sent you this via DM because I thought you might not see it otherwise` }
                                } });
                        }
                        resolve(true);
                    }).catch(o => {
                        if (o && o.message)
                            repl(mes.channel, mes.author, o.message, 'bad');
                        else
                            repl(mes.channel, mes.author, 'An error occured!', 'bad');
                        resolve(false);
                    });
                }).catch(err => {
                    repl(mes.channel, mes.author, 'An error occured!', 'bad');
                    resolve(false);
                });
            })
                .catch(err => {
                repl(mes.channel, mes.author, 'An error occured!', 'bad');
                console.error(err);
                resolve(false);
            });
        });
    }
};
//# sourceMappingURL=give.js.map