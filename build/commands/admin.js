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
const index_1 = require("../index");
const tudeapi_1 = require("../thirdparty/tudeapi/tudeapi");
const emojis_1 = require("../int/emojis");
const types_1 = require("../types/types");
const parse_args_1 = require("../util/parse-args");
const database_1 = require("../database/database");
const Items = require("../content/itemlist");
class AdminCommand extends types_1.Command {
    constructor() {
        super({
            name: 'admin',
            description: 'Admin',
            groups: ['internal'],
            sudoOnly: true,
        });
    }
    execute(orgChannel, user, args, event, repl) {
        if (user.id !== '137258778092503042')
            return false;
        try {
            if (args.length == 0) {
                repl('admin <cmd>', 'bad', ([
                    'setupchannelgames <channel>',
                    'itemlist',
                    'setupitemshop <channel>',
                    'resetdaily <user> [-c --clearstreak]',
                    'testmodlog',
                    'testlevelupreward'
                ]).map(cmd => `• ${cmd}`).join('\n'));
                return false;
            }
            let run = undefined;
            let cmdl = parse_args_1.default.parse(args);
            switch (args[0]) {
                case 'setupchannelgames':
                    run = () => __awaiter(this, void 0, void 0, function* () {
                        let channel = orgChannel.guild.channels.get(args[1]);
                        yield channel.send({ embed: { title: "I'm on top of the world!", url: 'https://www.youtube.com/watch?v=w5tWYmIOWGk' } });
                        yield channel.send(emojis_1.default.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + emojis_1.default.BIG_SPACE);
                        yield channel.send(emojis_1.default.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + emojis_1.default.BIG_SPACE);
                        yield channel.send(emojis_1.default.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + emojis_1.default.BIG_SPACE);
                        let lakeIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            yield channel.send('<the lake>').then(m => lakeIds.push(m.id));
                        yield channel.send(emojis_1.default.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + emojis_1.default.BIG_SPACE);
                        let mineIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            yield channel.send('<mineshaft>').then(m => mineIds.push(m.id));
                        yield channel.send(emojis_1.default.BIG_SPACE + '\n\n\n\n\n\n\n\n\n\n' + emojis_1.default.BIG_SPACE);
                        yield channel.send({
                            embed: {
                                title: 'Available Games:',
                                color: 0x00b0f4,
                                description: `[The Lake](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${lakeIds[0]})\n[Mineshaft](https://discordapp.com/channels/${orgChannel.guild.id}/${channel.id}/${mineIds[0]})\n`,
                                footer: {
                                    text: 'Click on a game\'s name to jump to it'
                                }
                            }
                        });
                        repl('Success!', 'success', `Lake:\n"${lakeIds.join('","')}"\n\nMine:\n"${mineIds.join('","')}"`);
                    });
                    run();
                    break;
                case 'setupemptychannel':
                    run = () => __awaiter(this, void 0, void 0, function* () {
                        let channel = orgChannel.guild.channels.get(args[1]);
                        for (let i = 0; i < 20; i++)
                            yield channel.send(emojis_1.default.BIG_SPACE);
                        repl('Success!', 'success');
                    });
                    run();
                    break;
                case 'itemlist':
                    // repl('Items:', 'success', Items.itemIdMap.map(i => i.id).join('\n')); TODO ITEMS
                    break;
                case 'resetdaily':
                    if (args.length < 2) {
                        repl('user?');
                        return;
                    }
                    run = () => __awaiter(this, void 0, void 0, function* () {
                        const user = yield (event.message.mentions.users.size
                            ? tudeapi_1.default.userByDiscordId(event.message.mentions.users.first().id)
                            : tudeapi_1.default.userById(args[1]));
                        const clearStreak = cmdl.c || cmdl.clearstreak;
                        const update = clearStreak
                            ? { '$set': { 'daily.last': 0 } }
                            : { '$inc': { 'daily.last': -1 } };
                        database_1.default
                            .get('tudeclub')
                            .collection('users')
                            .updateOne({ _id: user.id }, update);
                        repl('Yes sir!');
                    });
                    run();
                    break;
                case 'testmodlog':
                    index_1.TudeBot.modlog(orgChannel.guild, 'message', args.join(' '));
                    break;
                case 'testlevelupreward':
                    if (args.length < 2 || isNaN(parseInt(args[1]))) {
                        repl('level?');
                        return false;
                    }
                    const module = index_1.TudeBot.modules.get('getpoints');
                    module.assignLevelRoles(event.message.member, { level: parseInt(args[1]) });
                    break;
                case 'testperks':
                    tudeapi_1.default.clubUserByDiscordId(user.id, user).then(u => {
                        tudeapi_1.default.performClubUserAction(u, { id: 'obtain_perks', perks: 'club.cookies:[100-200]' }).then(console.log).catch(console.error);
                    });
                    break;
                case 'manualmemeofthemonth':
                    index_1.TudeBot.getModule('memes').electMemeOfTheMonth();
                    break;
                case 'testresponse':
                    repl('You got 10s - send me something nice!');
                    event.awaitUserResponse(user, orgChannel, 1000 * 10, (mes) => {
                        if (!mes)
                            orgChannel.send('Timed out!');
                        else
                            orgChannel.send(`You sent: \`${mes.content}\``);
                    });
                    break;
                case 'giveitem': {
                    if (args.length < 2) {
                        repl('Which one?');
                        return false;
                    }
                    const item = Items.findItem(args[1]);
                    if (!item) {
                        repl('Not found!');
                        return false;
                    }
                    tudeapi_1.default.clubUserByDiscordId(user.id, user).then(u => {
                        // u.addItem() // TODO
                    });
                    return true;
                }
            }
            return true;
        }
        catch (ex) {
            repl('Error:', 'bad', '```' + ex + '```');
            console.error(ex);
            return false;
        }
    }
}
exports.default = AdminCommand;
//# sourceMappingURL=admin.js.map