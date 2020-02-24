"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Module {
    constructor(dispName, usageScope, conf, data, lang) {
        this.dispName = dispName;
        this.usageScope = usageScope;
        this.conf = conf;
        this.data = data;
        this.lang = lang;
    }
}
exports.Module = Module;
class Command {
    constructor(name, aliases, description, sudoOnly, hideOnHelp, lang) {
        this.name = name;
        this.aliases = aliases;
        this.description = description;
        this.sudoOnly = sudoOnly;
        this.hideOnHelp = hideOnHelp;
        this.lang = lang;
    }
    init() { }
}
exports.Command = Command;
//# sourceMappingURL=types.js.map