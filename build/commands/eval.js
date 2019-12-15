"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'eval',
    aliases: [],
    desc: 'Eval',
    sudoonly: true,
    execute(bot, mes, sudo, args, repl) {
        if (mes.author.id !== '137258778092503042')
            return;
        try {
            repl(mes.channel, mes.author, eval(args.join(' ')));
        }
        catch (ex) {
            repl(mes.channel, mes.author, 'Error:', 'message', '```' + ex + '```');
        }
    }
};
//# sourceMappingURL=eval.js.map