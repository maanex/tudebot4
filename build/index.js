"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const settings = require('../config/settings.json');
class TudeBot extends discord_js_1.Client {
    constructor(props) {
        super(props);
        this.m = {};
        this.modules = [
            'modlog',
            'quotes',
            'counting'
        ];
        this.modules.forEach(mod => {
            this.m[mod] = require(`./modules/${mod}`)(this, settings.modules[mod], require(`../config/moduledata/${mod}.json`));
        });
        this.on('ready', () => console.log('Bot ready!'));
        this.login(settings.bot.token);
    }
}
exports.TudeBot = TudeBot;
const Core = new TudeBot({
    disabledEvents: [
        'TYPING_START',
    ]
});
//# sourceMappingURL=index.js.map