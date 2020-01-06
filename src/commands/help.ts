import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi from "../thirdparty/tudeapi/tudeapi";
import { Command } from "../modules/commands";




const _bigspace = '<:nothing:409254826938204171>';

const _nopes = [
    'nope',
    'no',
    'not for you',
    'big no'
]
const _yeses = [
    'yes',
    'perhaps',
    'most likely',
    'I think so',
    'probably',
    'possibly'
]

module.exports = {

    name: 'help',
    aliases: [ ],
    desc: 'Help!',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, desc?: string) => void): boolean {

        if (args.length < 1) {
            let text = '';
            let cmds = bot.m.commands.getCommands().sort();
            if (!sudo)
                cmds = cmds.filter(c => !c.sudoonly && !c.hideonhelp);
            let longest = 0;
            for (let cmd of cmds)
                if (cmd.name.length > longest)
                    longest = cmd.name.length;
            for (let cmd of cmds)
                text += `\`${('                   ' + cmd.name).substr(-longest-1)}\` ${cmd.sudoonly ? ('*' + cmd.desc + '*') : cmd.desc}\n`
            repl(mes.channel, mes.author, 'Help', 'message', text);
        } else {
            let cmd = args[0];
            let command: Command;
            out: for (let c of bot.m.commands.getCommands()) {
                if (c.name === cmd) {
                    command = c;
                    break out;
                }
                for (let a of c.aliases)
                    if (a === cmd) {
                        command = c;
                        break out;
                    }
            }
            if (!command) {
                switch (cmd.toLowerCase()) {
                    case 'me':
                        mes.channel.send(`I'm here for you ${mes.author} :)`);
                        break;

                    default:
                        repl(mes.channel, mes.author, 'UH...', 'bad', `Command ${cmd} not found!`);
                }
            } else {
                if (command.name == 'help') {
                    repl(mes.channel, mes.author, 'Help', 'message', helphelp(mes.author));
                } else {
                    mes.channel.send({ embed: {
                        title: command.name,
                        description: command.desc,
                        fields: [
                            {
                                name: 'Aliases',
                                value: command.aliases.length ? (command.aliases.join(', ') + _bigspace) : `[${_bigspace}](https://www.youtube.com/watch?v=cvh0nX08nRw)`,
                                inline: true
                            },
                            {
                                name: 'Allowed',
                                value: command.sudoonly ? _nopes[Math.floor(Math.random() * _nopes.length)] : _yeses[Math.floor(Math.random() * _yeses.length)],
                                inline: true
                            }
                        ]
                    }});
                }
            }
        }
        return true;
    }

}

let helphelpTexts = [
    'The requested page is not available',

    'Th̸e requeste̷d päge ̷is nót avaiIab̵le',

    'T̴h̸e̷ ̴r̶ḛ̷̑̌q̴u̶e̶s̸t̸e̷d̵̗̗͐ ̵p̶a̴g̸e̴ ̷i̵s̵ ̸n̸o̸t̵̺̗̏ ̶a̶v̵a̵i̴l̶a̷͓̾b̵l̷e̶',

    'T̸̝̔͒h̸͍̋ḙ̸͗ ̶̤͌r̸͈̻̉̑ḛ̷̑̌q̷͕̀ủ̸͉̐ė̵͇s̷̭̠̓̃t̸̖̣̂e̷̦̅d̵̗̗͐ ̷̻͛p̵̞͛͜a̵͍̔ģ̴̱̈́̕é̵̞ ̶̬̘́ḯ̴̯̳͘s̶̼͒̚ ̸̗̊̍n̴͖̠̏o̶̡͊t̵̺̗̏ ̴̛̣̟̆a̷̠͊͝ṿ̶̧̏a̷̜̕i̸̜̙͐͝l̵̗̟̿a̷͓̾b̴̦̺̍ľ̸̪͓̆ë̵̬̼̍',



    'T̴̡̨̛̬̥͕̪͖̜̻̰̮̳̖̣̳͔̻̥̬̟͙͑̓̿̾͊̌̽̀͌͋́̽́͛̈̅̀͆̎̊̆̏̊̌͊͘͜͝h̸̗̗͕̹̺̟̗͙̮̦̱̹͖͍̼͖̺̠̯̤͍̱͗̄̆͌̐̄̏̾͑̏͐̔͒̔̑͜͝͝ͅe̸̡̧͖̩̺̹̟͚̱̠͇̩͇̯̞̳͖̙̲͒͆̓̽̂̏̇̏͌͌̑͂̉̎̇͗͘͠͠ͅ ̴̛̤̝̰̩̳̪̗̝̘͓̬̰̩̊͑̋̇́̏r̸̲̙̪̭̱̪̪̲͖̩̲̮̜̖̭͎̃̑̐͌̈́̌͌͗̚͠͠e̴̡̢̨̧̛͓̫̲̱͖͉̺̞͂̆̈̌͊̀͆́̕͘̕q̴̮͍̠͖̱̼͉̹͎͕̝̝̮̱̻̪͔̦͈̯͈̘̹̟̗͈̜̠̪̼͚̙̝͐̿́͛͗̀͗̈̉̎́̾͂͒̌́̓͐́̓̌͋̑͗̔̅͑͗͌̀͝ͅͅų̶̛̞̺̺̣͖̱̹͔̠̦͇͉̘̐̏́̈́͗̌́͗̊̄̈́̋̐̒̿͆̃̈́͊͘͠è̴̫͉̬͙̀̈́̾̎̀͛̾̑̆̊̈́͐̒̎͆̀̃̉̚͘͠ŝ̶̡̨̧̡̳͓͈̙̖̭͚͚̺̱̩̪̲̣̳̯̭͈͚͚͖̠͇͑̂̀̅́̄̅͌̈̀̄̾͐͛͌̄̿͐̀̂̽̀͜͜͝t̶̢̨̗͖̩̯̹̯̫̠̙̪̠̝̖̼̟̭̠͓̝͍̠̥̙̣͓̟̜̞̩̰͐̾̄̈̑̎̾̑̓͂̒̈́͗͊̎̎̏̌̈́̍͒̋̒͒̈́͘͜͜͠ȩ̵̡̡̛̛͚̘̙͇̞͎̖̟̯̟̼̤̜̣̻̱̮̱͇͕̗͓̮̌͋̈́̽̃̎͐͂̈́͠͠͠͠ͅͅd̴̟͚͕̬͙̞̫͎̱͍̞̻͖̦̦̳͇̟͖͙̠̙̟̩̬̿̏̋̾̓̉̅̍͋ ̴̡̧̛̳̮͈̃̃̃͆͑̅̿̅̿̽̾̓̅͑̈́̈́̏͗͌͆̏͊̈͗̊͗̽̄̌̄̇̕͠͝p̴̨̢̛̛͎͙͔͚͎͍̪̼̞͕̪̈͑͂͋͋̓̒̂̓̿̆͛̄̏́͌̌̀̃́̀̍̂̈͝ͅa̶̧̢̛̳̳̬͇̗̻͉̲̠̭͙͙̦͍̮̲̱̝̭̺̤͚̲͕̫͉̔̈̒̿̎̈́̍̇̾̈́́̽͂̋͛̇̈́̆̿͊͗̄͗̌͜͠ǧ̶̢̢̨͉̗̜̖̗̘͈̠̥͎̖̹̥̪͕̙͚̹̼̣̳̖͊̔̈̾̓̈͑̇̌̂̇͝ȩ̸̢̢̟̼̣̦͓͙̰̰̺̪̜̪̥̩̬̜̬̭̼̞̥̽̅̓̓̄̑̑̉̌̃̌́̅͘̚̕͠ͅͅͅ ̷̢̡̨̢̧̧̧̛̳̫̝͔̗̥̤̖͉̮̘̦͙̣̪͍̮͍̦̥̘̦͖͔̟̮̗͆̏̎̍͂̃̔̈́̊̓͐͋̽̄͒̈́̐̔̀͛̎̋͘̚͠͝͝i̸̧̢̨̢̡̧̺͇̼̗̬̦̯͇͎̞̥̹͎̜͉̰̬̫͙̥̱̠̗͓̼͇͌̑̽̆̀̂͗́̌̆̉͂͌̇̊̄̒͊͊̓̀̅̒̾̈̔͜͝͝͠ͅͅs̶̡̘̘͉͍͔̬̞͓͉̱̺͋̈́̽̓̇͋͛̍̾̎̒͂͝ͅ ̵̡̠͓̞̞̮̻̮̘͙̰̺̼̤̜̜̥̯̣͉̲͍̼͖̙͚̘̫͔͎̥̠̦̦̘̈́̈͑̍̾̿̾̿̋̈́̌̒̿͗͊̑͆̿̆̆̀̈̉̆̓̿͆̌̑͌̓͌͘͝͝ņ̴̨̛̛̼̰͕̯̟̫̞̲̳̲̬̊̎͋̇͑͛̑̀͒̾̈́̍̽̎́̍̈̈́̓́͒̕̕͝͝o̴̭̦̱̜͖̟͍̦̙̺̰̬̙̼̮̬͕͓͗͗̂̋̐̂͒̒̈͘͜͠t̶̛̛͚̫̖̫͖͔̖͙͋̑̐̅̀̔͂̉̽̈͐͗͊̉͌̄̚ ̵̨̢̧̡̢̛͖̠̤̖̣̤̥͎̜̤̭̰̳͍̈́̆̋̂̒͜͝ͅa̸̧̨̨̨̰͉͉̞̩̞͉̹̖̘̫̲̲̭͈̙̖̩̍́͗͝v̷̧͉̞̟̠̺͙̹̪̥͖̞͖̙̮̱̝̝̩̳̪̣̭͖̂͋͋̓̿͛̚͜a̶͍̞͉̟̳̾̿̔͐́́̂̇̋͌̈́͊̌̐̅̐͑i̴̠̩̯̮͙̳̗̜̜̥̘̼͇̭͊̈́̋͜l̴̹̻̫̟͆̀̍̏̆̌̚͝͝ä̵̢̡̨̧̡̡̛͙̖̮̤̙̱̯̥͓͚̪̞͈͚̪͚̩̋̋̈̈̉̐̿̈́̌̎͗͂̃̋͂̈́͂̾͂͛͒͛̚̚͘͜͝͝͠͝b̵̲̮̳̺͓̻̦͍̲͙̝̀̓̎̑͋̏̄̾̍͛̊̈̾̊̑̿͊̏̚̕ͅl̸̨̜̞̪̜̺͍͉̬̜̹̬̤̱͍̘͕͈͓͖̼͙̤̣̰̪̔̏̀͒͒̉͘͠ͅͅe̸̳̦͂̀͒̅͐',



    '',

    '[◉](https://omega.maanex.tk/)',

];

let userQueries = {};
let userQueryReset = {};

function helphelp(user: User): string {
    if (!userQueries[user.id])
        userQueries[user.id] = 0;
    if (userQueryReset[user.id])
        clearTimeout(userQueryReset[user.id]);
    userQueryReset[user.id] = setTimeout(() => {
        delete userQueries[user.id];
    }, 10 * 60_000);
    let txt = helphelpTexts[userQueries[user.id]];
    userQueries[user.id]++;
    if (txt == undefined) {
        let dashes = '⚊⚊';
        while (Math.random() < userQueries[user.id] / 20 && dashes.length < 200)
            dashes += '⚊';
        txt = `**[${dashes}]**`;
    }
    if (userQueries[user.id] > 40)
        txt = 'Ω';
    return txt;
}