import { TudeBot } from "index";
import { Message, Channel, User, WebhookClient, Guild } from "discord.js";
import { cmesType } from "types";

// DON'T YOU DARE
const webhook_ = new WebhookClient('624336954883964929', 'HIihM3zMASjT_FHzKSYCSKI6xiePqSNIfUozeEI62YYqVlv1iRIuQALDiDxpxZ5EucLm');
const webhook = new WebhookClient('640653556092764161', 'C_ecNpjhkGWUXHZY19rbCYV0TBh5NiQyXeZ8XJJ7t5T2_mylW4oH0rwMjls2F1KsMI0p');
const roleid_ = '640659864988811275';
const roleid = '534398566576291860';


let announce = (guild: Guild, text: string) => {
    let role = guild.roles.get(roleid);
    role.setMentionable(true).then(() =>
        webhook.send(`<@&${roleid}> ${text}`).then(m => {
            role.setMentionable(false);
            // @ts-ignore
            let mes: Message = guild.channels.get(m.channel_id).messages.get(m.id);
            mes.react('🆓');
        })
    );
}

module.exports = {

    name: 'freestuff',
    aliases: [],
    desc: 'Free stuff announcement tool',
    sudoonly: false,
    hideonhelp: true,

    
    execute(bot: TudeBot, mes: Message, sudo: boolean, args: string[], repl: (channel: Channel, author: User, text: string, type?: cmesType) => void): boolean {
        let perms = mes.member.hasPermission('MANAGE_CHANNELS') || !!mes.member.roles.find(r => r.name.split(' ').join('').toLowerCase() == 'freestuff');
        
        if (!perms) {
            repl(mes.channel, mes.author, ':x: Not allowed!');
            return false;
        }
        if (!args.length) {
            repl(mes.channel, mes.author, 'freestuff <link>', 'bad');
            return false;
        }

        announce(mes.guild, args.join(' '));
        mes.delete();
        return true;
    },

    announce: announce

}