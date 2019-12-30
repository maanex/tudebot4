"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'eval',
    aliases: [],
    desc: 'Eval',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        if (mes.author.id !== '137258778092503042')
            return false;
        try {
            repl(mes.channel, mes.author, eval(args.join(' ')));
            return true;
        }
        catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'message', '```' + ex + '```');
            return false;
        }
    }
};
//# sourceMappingURL=eval.js.map