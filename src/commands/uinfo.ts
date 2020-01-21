import { TudeBot } from "index";
import { Message, Channel, User } from "discord.js";
import { cmesType } from "types";
import TudeApi, { Badge, ClubUser } from "../thirdparty/tudeapi/tudeapi";
import ParseArgs from "../util/parseArgs";

const fetch = require('node-fetch');


module.exports = {

    name: 'uinfo',
    aliases: [
    ],
    desc: 'Userinfo',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType, description?: string) => void): Promise<boolean> {
    return new Promise((resolve, reject) => {
        let cmdl = ParseArgs.parse(args);
        let user = mes.author;
        if (mes.mentions.users.size)
            user = mes.mentions.users.first();

        if (cmdl['?'] || cmdl.help || cmdl._ == '?' || cmdl._ == 'help') {
            mes.channel.send(`\`\`\`Options:
              --help  -?    shows this help page
   --inventory --inv  -i    renders out the inventory
            --hidden  -h    shows hidden fields (like _org_ or _raw_)
               --all  -a    shows all fields (-i and -h combined)
\`\`\``);
        }
        
        ((user == mes.author && cmdl._) ? TudeApi.clubUserById(cmdl._ as string) : TudeApi.clubUserByDiscordId(user.id/*, mes.author*/) ) // Don't create a new profile on loopup
            .then(u => {
                if (!u || u.error) {
                    repl(mes.channel, mes.author, 'User not found!', 'message', 'Or internal error, idk');
                    resolve(false);
                    return;
                }

                let out = JSON.parse(JSON.stringify(u));

                if (!cmdl.h && !cmdl.hidden && !cmdl.all && !cmdl.a) {
                    for (let index in out) {
                        if (index.charAt(0) == '_')
                            delete out[index];
                    }
                }

                if (!cmdl.i && !cmdl.inv && !cmdl.inventory && !cmdl.all && !cmdl.a) {
                    out['inventory'] = '.array.';
                    if (out['_raw_inventory'])
                        out['_raw_inventory'] = '.array.';
                }
                
                let str = '```json\n' + JSON.stringify(out, null, 2) + '```';
                str = str.split('".array."').join('[ ... ]').split('".object."').join('{ ... }');
                if (str.length > 2000) repl(mes.channel, mes.author, 'The built message is too long. Consider not showing parts like the inventory or hidden atributes');
                else repl(mes.channel, mes.author, str);
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