import { TudeBot } from "index";
import { Message, Channel, User, TextChannel } from "discord.js";
import { cmesType } from "types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";



const _bigspace = '<:nothing:409254826938204171>';

module.exports = {

    name: 'admin',
    aliases: [ ],
    desc: 'Admin',
    sudoonly: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, desc?: string) => void): boolean {
        if (mes.author.id !== '137258778092503042') return false;

        try {
            if (args.length == 0) {
                repl(mes.channel, mes.author, 'admin <cmd>', 'bad', '• setupchannelgames <channel>\n• itemlist\n• setupitemshop <channel>');
                return false;
            }

            let run: () => {} = undefined;
            switch (args[0]) {
                case 'setupchannelgames':
                    run = async () => {
                        let channel = mes.guild.channels.get(args[1]) as TextChannel;
                        await channel.send({ embed: { title: "I'm on top of the world!", url: 'https://www.youtube.com/watch?v=w5tWYmIOWGk' }});
                        await channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        await channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        await channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        let lakeIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            await channel.send('<the lake>').then(m => lakeIds.push(m.id));
                        await channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        let mineIds = [];
                        for (let i = 0; i < 11; i++)
                            // @ts-ignore
                            await channel.send('<mineshaft>').then(m => mineIds.push(m.id));    
                        await channel.send(_bigspace + '\n\n\n\n\n\n\n\n\n\n' + _bigspace);
                        await channel.send({ embed: {
                            title: 'Available Games:',
                            color: 0x00b0f4,
                            description: `[The Lake](https://discordapp.com/channels/${mes.guild.id}/${channel.id}/${lakeIds[0]})\n[Mineshaft](https://discordapp.com/channels/${mes.guild.id}/${channel.id}/${mineIds[0]})\n`,
                            footer: {
                                text: 'Click on a game\'s name to jump to it'
                            }
                        }});
                        repl(mes.channel, mes.author, 'Success!', 'success', `Lake:\n"${lakeIds.join('","')}"\n\nMine:\n"${mineIds.join('","')}"`);
                    }; run();
                    break;

                case 'setupitemshop':
                    run = async () => {
                        let channel = mes.guild.channels.get(args[1]) as TextChannel;
                        for (let i = 0; i < 20; i++)
                            await channel.send(_bigspace);
                        repl(mes.channel, mes.author, 'Success!', 'success');
                    }; run();
                    break;

                case 'itemlist':
                    repl(mes.channel, mes.author, 'Items:', 'success', TudeApi.items.map(i => i.id + ': ' + i.name).join('\n'));
                    break;
            }
            return true;
        } catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'bad', '```' + ex + '```');
            return false;
        }
    }

}