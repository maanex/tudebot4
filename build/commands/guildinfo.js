"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
const index_1 = require("../index");
class GuildInfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'guildinfo',
            description: 'Shows some guild info',
            groups: ['internal', 'info'],
            hideOnHelp: true
        });
    }
    execute(channel, user, args, event, repl) {
        const settings = index_1.TudeBot.guildSettings.get(channel.guild.id);
        if (!settings) {
            repl('No settings found for this guild!', 'bad');
            return;
        }
        const moduleData = [];
        index_1.TudeBot.modules.forEach((module, id) => {
            moduleData.push((settings.modules[id] ? '🗹 ' : '☐ ') + module.dispName);
        });
        channel.send({ embed: {
                title: settings.name,
                color: 0x2f3136,
                fields: [
                    {
                        name: 'Is club guild?',
                        value: settings.club ? 'Yes' : 'No',
                        inline: true
                    },
                    {
                        name: 'Managers:',
                        value: Object.keys(settings.managers).join('\n'),
                        inline: true
                    },
                    {
                        name: 'Modules:',
                        value: moduleData.join('\n')
                    }
                ]
            } });
        return true;
    }
}
exports.default = GuildInfoCommand;
//# sourceMappingURL=guildinfo.js.map