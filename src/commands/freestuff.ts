import { TudeBot } from "index";
import { Message, Channel, User, WebhookClient } from "discord.js";
import { cmesType } from "types";

const webhook_beta = new WebhookClient('640662711574855682', 'C_ecNpjhkGWUXHZY19rbCYV0TBh5NiQyXeZ8XJJ7t5T2_mylW4oH0rwMjls2F1KsMI0p');
const webhook = new WebhookClient('640653556092764161', 'C_ecNpjhkGWUXHZY19rbCYV0TBh5NiQyXeZ8XJJ7t5T2_mylW4oH0rwMjls2F1KsMI0p');
const roleid_beta = '640659864988811275';
const roleid = '534398566576291860';

module.exports = {

    name: 'freestuff',
    aliases: [],
    desc: 'Free stuff announcement tool',
    sudoonly: false,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void) {
        let perms = mes.member.hasPermission('MANAGE_CHANNELS') || !!mes.member.roles.find(r => r.name.split(' ').join('').toLowerCase() == 'freestuff');
        
        if (!perms) {
            repl(mes.channel, mes.author, ':x: Not allowed!');
            return;
        }
        if (!args.length) {
            repl(mes.channel, mes.author, 'freestuff <link>', 'bad');
            return;
        }

        let role = mes.guild.roles.get(roleid);
        role.setMentionable(true).then(() =>
            webhook.send(`<@&${roleid}> ${args.join(' ')}`).then(m => {
                role.setMentionable(false);
                (m as Message).react('🆓');
            })
        );
        mes.delete();
    }

}