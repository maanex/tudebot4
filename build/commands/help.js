"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const emojis_1 = require("../int/emojis");
const types_1 = require("../types");
class HelpCommand extends types_1.Command {
    constructor(lang) {
        super('help', ('.?!/%-+=~&,:'.split('').map(p => p + 'help')), 'Help!', 0, false, true, lang);
        this._nopes = [
            'nope',
            'no',
            'not for you',
            'big no'
        ];
        this._yeses = [
            'yes',
            'perhaps',
            'most likely',
            'I think so',
            'probably',
            'possibly'
        ];
        //
        this.helphelpTexts = [
            'The requested page is not available',
            'Th̸e requeste̷d päge ̷is nót avaiIab̵le',
            'T̴h̸e̷ ̴r̶ḛ̷̑̌q̴u̶e̶s̸t̸e̷d̵̗̗͐ ̵p̶a̴g̸e̴ ̷i̵s̵ ̸n̸o̸t̵̺̗̏ ̶a̶v̵a̵i̴l̶a̷͓̾b̵l̷e̶',
            'T̸̝̔͒h̸͍̋ḙ̸͗ ̶̤͌r̸͈̻̉̑ḛ̷̑̌q̷͕̀ủ̸͉̐ė̵͇s̷̭̠̓̃t̸̖̣̂e̷̦̅d̵̗̗͐ ̷̻͛p̵̞͛͜a̵͍̔ģ̴̱̈́̕é̵̞ ̶̬̘́ḯ̴̯̳͘s̶̼͒̚ ̸̗̊̍n̴͖̠̏o̶̡͊t̵̺̗̏ ̴̛̣̟̆a̷̠͊͝ṿ̶̧̏a̷̜̕i̸̜̙͐͝l̵̗̟̿a̷͓̾b̴̦̺̍ľ̸̪͓̆ë̵̬̼̍',
            'T̴̡̨̛̬̥͕̪͖̜̻̰̮̳̖̣̳͔̻̥̬̟͙͑̓̿̾͊̌̽̀͌͋́̽́͛̈̅̀͆̎̊̆̏̊̌͊͘͜͝h̸̗̗͕̹̺̟̗͙̮̦̱̹͖͍̼͖̺̠̯̤͍̱͗̄̆͌̐̄̏̾͑̏͐̔͒̔̑͜͝͝ͅe̸̡̧͖̩̺̹̟͚̱̠͇̩͇̯̞̳͖̙̲͒͆̓̽̂̏̇̏͌͌̑͂̉̎̇͗͘͠͠ͅ ̴̛̤̝̰̩̳̪̗̝̘͓̬̰̩̊͑̋̇́̏r̸̲̙̪̭̱̪̪̲͖̩̲̮̜̖̭͎̃̑̐͌̈́̌͌͗̚͠͠e̴̡̢̨̧̛͓̫̲̱͖͉̺̞͂̆̈̌͊̀͆́̕͘̕q̴̮͍̠͖̱̼͉̹͎͕̝̝̮̱̻̪͔̦͈̯͈̘̹̟̗͈̜̠̪̼͚̙̝͐̿́͛͗̀͗̈̉̎́̾͂͒̌́̓͐́̓̌͋̑͗̔̅͑͗͌̀͝ͅͅų̶̛̞̺̺̣͖̱̹͔̠̦͇͉̘̐̏́̈́͗̌́͗̊̄̈́̋̐̒̿͆̃̈́͊͘͠è̴̫͉̬͙̀̈́̾̎̀͛̾̑̆̊̈́͐̒̎͆̀̃̉̚͘͠ŝ̶̡̨̧̡̳͓͈̙̖̭͚͚̺̱̩̪̲̣̳̯̭͈͚͚͖̠͇͑̂̀̅́̄̅͌̈̀̄̾͐͛͌̄̿͐̀̂̽̀͜͜͝t̶̢̨̗͖̩̯̹̯̫̠̙̪̠̝̖̼̟̭̠͓̝͍̠̥̙̣͓̟̜̞̩̰͐̾̄̈̑̎̾̑̓͂̒̈́͗͊̎̎̏̌̈́̍͒̋̒͒̈́͘͜͜͠ȩ̵̡̡̛̛͚̘̙͇̞͎̖̟̯̟̼̤̜̣̻̱̮̱͇͕̗͓̮̌͋̈́̽̃̎͐͂̈́͠͠͠͠ͅͅd̴̟͚͕̬͙̞̫͎̱͍̞̻͖̦̦̳͇̟͖͙̠̙̟̩̬̿̏̋̾̓̉̅̍͋ ̴̡̧̛̳̮͈̃̃̃͆͑̅̿̅̿̽̾̓̅͑̈́̈́̏͗͌͆̏͊̈͗̊͗̽̄̌̄̇̕͠͝p̴̨̢̛̛͎͙͔͚͎͍̪̼̞͕̪̈͑͂͋͋̓̒̂̓̿̆͛̄̏́͌̌̀̃́̀̍̂̈͝ͅa̶̧̢̛̳̳̬͇̗̻͉̲̠̭͙͙̦͍̮̲̱̝̭̺̤͚̲͕̫͉̔̈̒̿̎̈́̍̇̾̈́́̽͂̋͛̇̈́̆̿͊͗̄͗̌͜͠ǧ̶̢̢̨͉̗̜̖̗̘͈̠̥͎̖̹̥̪͕̙͚̹̼̣̳̖͊̔̈̾̓̈͑̇̌̂̇͝ȩ̸̢̢̟̼̣̦͓͙̰̰̺̪̜̪̥̩̬̜̬̭̼̞̥̽̅̓̓̄̑̑̉̌̃̌́̅͘̚̕͠ͅͅͅ ̷̢̡̨̢̧̧̧̛̳̫̝͔̗̥̤̖͉̮̘̦͙̣̪͍̮͍̦̥̘̦͖͔̟̮̗͆̏̎̍͂̃̔̈́̊̓͐͋̽̄͒̈́̐̔̀͛̎̋͘̚͠͝͝i̸̧̢̨̢̡̧̺͇̼̗̬̦̯͇͎̞̥̹͎̜͉̰̬̫͙̥̱̠̗͓̼͇͌̑̽̆̀̂͗́̌̆̉͂͌̇̊̄̒͊͊̓̀̅̒̾̈̔͜͝͝͠ͅͅs̶̡̘̘͉͍͔̬̞͓͉̱̺͋̈́̽̓̇͋͛̍̾̎̒͂͝ͅ ̵̡̠͓̞̞̮̻̮̘͙̰̺̼̤̜̜̥̯̣͉̲͍̼͖̙͚̘̫͔͎̥̠̦̦̘̈́̈͑̍̾̿̾̿̋̈́̌̒̿͗͊̑͆̿̆̆̀̈̉̆̓̿͆̌̑͌̓͌͘͝͝ņ̴̨̛̛̼̰͕̯̟̫̞̲̳̲̬̊̎͋̇͑͛̑̀͒̾̈́̍̽̎́̍̈̈́̓́͒̕̕͝͝o̴̭̦̱̜͖̟͍̦̙̺̰̬̙̼̮̬͕͓͗͗̂̋̐̂͒̒̈͘͜͠t̶̛̛͚̫̖̫͖͔̖͙͋̑̐̅̀̔͂̉̽̈͐͗͊̉͌̄̚ ̵̨̢̧̡̢̛͖̠̤̖̣̤̥͎̜̤̭̰̳͍̈́̆̋̂̒͜͝ͅa̸̧̨̨̨̰͉͉̞̩̞͉̹̖̘̫̲̲̭͈̙̖̩̍́͗͝v̷̧͉̞̟̠̺͙̹̪̥͖̞͖̙̮̱̝̝̩̳̪̣̭͖̂͋͋̓̿͛̚͜a̶͍̞͉̟̳̾̿̔͐́́̂̇̋͌̈́͊̌̐̅̐͑i̴̠̩̯̮͙̳̗̜̜̥̘̼͇̭͊̈́̋͜l̴̹̻̫̟͆̀̍̏̆̌̚͝͝ä̵̢̡̨̧̡̡̛͙̖̮̤̙̱̯̥͓͚̪̞͈͚̪͚̩̋̋̈̈̉̐̿̈́̌̎͗͂̃̋͂̈́͂̾͂͛͒͛̚̚͘͜͝͝͠͝b̵̲̮̳̺͓̻̦͍̲͙̝̀̓̎̑͋̏̄̾̍͛̊̈̾̊̑̿͊̏̚̕ͅl̸̨̜̞̪̜̺͍͉̬̜̹̬̤̱͍̘͕͈͓͖̼͙̤̣̰̪̔̏̀͒͒̉͘͠ͅͅe̸̳̦͂̀͒̅͐',
            '',
            '[◉](https://omega.maanex.tk/)',
        ];
        this.userQueries = {};
        this.userQueryReset = {};
    }
    execute(channel, user, args, event, repl) {
        if (args.length < 1) {
            let text = '';
            let cmds = index_1.TudeBot.getModule('commands').getCommands().sort();
            if (!event.sudo) {
                cmds = cmds.filter(c => !c.sudoOnly && !c.hideOnHelp);
            }
            let longest = 0;
            for (let cmd of cmds) {
                if (cmd.name.length > longest)
                    longest = cmd.name.length;
            }
            for (let cmd of cmds) {
                text += `\`${((cmd.hideOnHelp ? '•' : '') + cmd.name).padStart(longest + 1)}\` ${cmd.sudoOnly ? ('**' + cmd.description + '**') : cmd.description.split('\n')[0]}\n`; // wtf?
            }
            repl('Help', 'message', text);
        }
        else {
            let cmd = args[0];
            let command;
            out: for (let c of index_1.TudeBot.getModule('commands').getCommands()) {
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
                        channel.send(`I'm here for you ${user} :)`);
                        break;
                    default:
                        repl('UH...', 'bad', `Command ${cmd} not found!`);
                }
            }
            else {
                if (command.name == 'help' && !event.sudo) {
                    repl('Help', 'message', this.helphelp(user));
                }
                else {
                    let easteregg = [];
                    if (Math.random() < 0.1) {
                        easteregg.push({
                            name: 'Hotel',
                            value: 'Trivago',
                            inline: true
                        });
                    }
                    channel.send({
                        embed: {
                            title: command.name,
                            description: command.description,
                            fields: [
                                {
                                    name: 'Aliases',
                                    value: command.aliases.length ? (command.aliases.join(', ') + emojis_1.default.BIG_SPACE) : `[${emojis_1.default.BIG_SPACE}](https://www.youtube.com/watch?v=cvh0nX08nRw)`,
                                    inline: true
                                },
                                {
                                    name: 'Allowed',
                                    value: command.sudoOnly ? this._nopes[Math.floor(Math.random() * this._nopes.length)] : this._yeses[Math.floor(Math.random() * this._yeses.length)],
                                    inline: true
                                }, ...easteregg
                            ]
                        }
                    });
                }
            }
        }
        return true;
    }
    helphelp(user) {
        if (!this.userQueries[user.id])
            this.userQueries[user.id] = 0;
        if (this.userQueryReset[user.id])
            clearTimeout(this.userQueryReset[user.id]);
        this.userQueryReset[user.id] = setTimeout(() => {
            delete this.userQueries[user.id];
        }, 10 * 60000);
        let txt = this.helphelpTexts[this.userQueries[user.id]];
        this.userQueries[user.id]++;
        if (txt == undefined) {
            let dashes = '⚊⚊';
            while (Math.random() < this.userQueries[user.id] / 20 && dashes.length < 200)
                dashes += '⚊';
            txt = `**[${dashes}]**`;
        }
        if (this.userQueries[user.id] > 40)
            txt = 'Ω';
        return txt;
    }
}
exports.default = HelpCommand;
//# sourceMappingURL=help.js.map