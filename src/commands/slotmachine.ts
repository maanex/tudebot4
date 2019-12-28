import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";
import { activeInCommandsChannel } from "../modules/commands";

const fetch = require('node-fetch');


const nothingEmoji = '<:nothing:491651815679590420>';

const sm1emoji = {
    loading: [
        '<a:sm1c1:660603142710231060>',
        '<a:sm1c2:660603131553644554>',
        '<a:sm1c3:660603123831668787>',
        '<a:sm1c4:660603113601761299>',
        '<a:sm1c5:660603103703334912>',
        '<a:sm1c6:660601810632835114>',
    ]
}

const sm1template = `[ᴄᴏᴏᴋɪᴇᴡʜᴇᴇʟ]
​ ​ ▽ ​ ​ ​ ​ ​ ▽ ​ ​ ​ ​ ​ ▽
​ %s ​ ​ ​ %s    ​ ​ ​ %s
​ ​ △ ​ ​ ​ ​ ​ △ ​ ​ ​ ​ ​ △`;

const sm2template = `|\`🎲 Ｎｉｃｅｒ　Ｄｉｃｅｒ 🎲\`|
​ ​ ​ ​ ​ ​ ​ ​ ┌ :: :: :: :: :: ┐
​ ​ ​ ​ ​ ​ ::%s %s %s %s %s
​ ​ ​ ​ ​ ​ ​ ​ └ :: :: :: :: :: ┘`.split('::').join(nothingEmoji);

const sm3template = `𝘿𝙖𝙣𝙘𝙚𝙢𝙖𝙨𝙩𝙚𝙧
♫ ★ ​  ​  ​  ​  ​  ​  ​  ​  ​  ​    ♪
​  ♪ ​  ​  %s %s %s
​  ​ ​  ​  ​  ​ %s %s %s ​  ​  ♫
​  ★​  ​ %s %s %s
​ ​ ​ ​ ♫ ​ ​​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ♪  ★`;

const sm4template = `**ㄒㄩ尺乃ㄖ匚卄卂尺Ꮆ乇尺**
◢─────────────◣
​ ◖%s %s %s %s %s %s◗
◥─────────────◤`



module.exports = {

    name: 'slotmachine',
    aliases: [
        'sm'
    ],
    desc: 'Sweet game of Slotmachine',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void) {
        
        if (args.length < 1) {
            repl(mes.channel, mes.author, 'slotmachine <machine>', 'bad', 'Available machines:\n1: Cookiewheel\n 2: Foo\n 3: Dancemaster\n`slotmachine info <machine>` for more info');
            return;
        }

        let out = '';
        switch (args[0]) {
            case '1':
                out = sm1template;
                break;
            case '2':
                out = sm2template;
                break;
            case '3':
                out = sm3template;
                break;
            case '4':
                out = sm4template;
                break;
        }
        while (out.indexOf('%s') >= 0)
            out = out.replace('%s', sm1emoji.loading[Math.floor(Math.random() * 6)]);

        mes.reply({ embed: {
            title: 'Slotmachine',
            description: out
        }});
        
    }

}