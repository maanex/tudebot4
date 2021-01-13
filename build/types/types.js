"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    // eslint-disable-next-line no-useless-constructor
    constructor(dispName, usageScope, conf, data, guilds, lang) {
        this.dispName = dispName;
        this.usageScope = usageScope;
        this.conf = conf;
        this.data = data;
        this.guilds = guilds;
        this.lang = lang;
    }
    //
    isMessageEventValid(mes) {
        if (mes.author.bot)
            return false;
        if (!mes.guild)
            return false;
        if (!this.isEnabledInGuild(mes.guild))
            return false;
        return true;
    }
    isEnabledInGuild(guild) {
        if (!guild)
            return false;
        return this.guilds.has(guild.id);
    }
    guildData(guild) {
        return this.isEnabledInGuild(guild) ? this.guilds.get(guild.id) : {};
    }
}
exports.Module = Module;
class Command {
    constructor(settings) {
        this.settings = settings;
        if (!settings.aliases)
            settings.aliases = [];
        if (!settings.cooldown)
            settings.cooldown = 0;
        if (!settings.groups)
            settings.groups = [];
        if (!settings.hideOnHelp)
            settings.hideOnHelp = false;
        if (!settings.sudoOnly)
            settings.sudoOnly = false;
    }
    get name() { return this.settings.name; }
    get aliases() { return this.settings.aliases; }
    get description() { return this.settings.description; }
    get cooldown() { return this.settings.cooldown; }
    get groups() { return this.settings.groups; }
    get sudoOnly() { return this.settings.sudoOnly; }
    get hideOnHelp() { return this.settings.hideOnHelp; }
    init() { }
}
exports.Command = Command;
//# sourceMappingURL=types.js.map