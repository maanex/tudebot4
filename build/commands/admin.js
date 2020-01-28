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
const _bigspace = '<:nothing:409254826938204171>';
module.exports = {
    name: 'admin',
    aliases: [],
    desc: 'Admin',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        if (mes.author.id !== '137258778092503042')
            return false;
        try {
            if (args.length == 0) {
                repl(mes.channel, mes.author, 'admin <cmd>', 'bad', '• setupchannelgames <channel>\n• itemlist\n• setupitemshop <channel>');
                return false;
            }
            let run = undefined;
            switch (args[0]) {
                case 'setupchannelgames':
                    run = () => __awaiter(this, void 0, void 0, function* () {
                        let channel = mes.guild.channels.get(args[1]);
                        yield channel.send({ embed: { title: "I'm on top of the world!", url: 'https://www.youtube.com/watch?v=w5tWYmIOWGk' } });
                        yield channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        yield channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        yield channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        let lakeIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            yield channel.send('<the lake>').then(m => lakeIds.push(m.id));
                        yield channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        let mineIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            yield channel.send('<mineshaft>').then(m => mineIds.push(m.id));
                        yield channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        yield channel.send({ embed: {
                                title: 'Available Games:',
                                color: 0x00b0f4,
                                description: `[The Lake](https://discordapp.com/channels/${mes.guild.id}/${channel.id}/${lakeIds[0]})\n[Mineshaft](https://discordapp.com/channels/${mes.guild.id}/${channel.id}/${mineIds[0]})\n`,
                                footer: {
                                    text: 'Click on a game\'s name to jump to it'
                                }
                            } });
                        repl(mes.channel, mes.author, 'Success!', 'success', `Lake:\n"${lakeIds.join('","')}"\n\nMine:\n"${mineIds.join('","')}"`);
                    });
                    run();
                    break;
                case 'setupitemshop':
                    run = () => __awaiter(this, void 0, void 0, function* () {
                        let channel = mes.guild.channels.get(args[1]);
                        for (let i = 0; i < 20; i++)
                            yield channel.send(_bigspace);
                        repl(mes.channel, mes.author, 'Success!', 'success');
                    });
                    run();
                    break;
                case 'itemlist':
                    repl(mes.channel, mes.author, 'Items:', 'success', tudeapi_1.default.items.map(i => i.id + ': ' + i.name).join('\n'));
                    break;
            }
            return true;
        }
        catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'bad', '```' + ex + '```');
            return false;
        }
    }
};
//# sourceMappingURL=admin.js.map