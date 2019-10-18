import { modlogType } from '../types';
import { TudeBot } from "index";
import { GuildMember, TextChannel } from "discord.js";


module.exports = (bot: TudeBot, conf: any, data: any, lang: Function) => {
    
    let lastDay = '';

    function check() {
        let date = new Date();
        let dstr = date.getDate() + '-' + (date.getMonth() + 1);
        if (lastDay == dstr) return;
        lastDay = dstr;

        let maxdelay = 1000 * 60 * 60 * 5; // 5h
        setTimeout((daystr, bot, conf, data) => {
            let users = [];
            for (let user in data) {
                if (data[user] == daystr)
                    users.push(user);
            }
            if (!users.length) return;
            let msg = lang(users.length > 1 ? 'birthday_message_mult' : 'birthday_message');
            let usrstr = users.map(u => `<@${u}>`).join(' & ');
            msg = msg.split('{}').join(usrstr);

            for (let c of conf.channels) {
                let gid = c.split('/')[0];
                let cid = c.split('/')[1];
                let guild = bot.guilds.find(g => g.id == gid);
                if (!guild) continue;
                let channel = guild.channels.find(c => c.id == cid);
                if (!channel || channel.type !== 'text') continue;
                (channel as TextChannel).send(`@everyone ${msg}`);
            }
        }, Math.floor(Math.random() * maxdelay), dstr, bot, conf, data);
    }

    bot.on('ready', () => {        
        setInterval(check, 1000 * 60 * 60);
        check();
    });

    
}