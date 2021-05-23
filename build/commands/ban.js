"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types/types");
class BanCommand extends types_1.Command {
    constructor() {
        super({
            name: 'ban',
            description: 'Ban someone',
            hideOnHelp: true,
            groups: ['moderation']
        });
        if (BanCommand.banCreditRefiller)
            clearTimeout(BanCommand.banCreditRefiller);
        BanCommand.banCreditRefiller = setTimeout(() => {
            for (const user of BanCommand.banCredit.keys()) {
                BanCommand.banCredit.set(user, BanCommand.banCredit.get(user) + 1);
                if (BanCommand.banCredit.get(user) >= BanCommand.BAN_CREDIT_MAX_AMOUNT)
                    BanCommand.banCredit.delete(user);
            }
        }, 1000 * 60 * 60);
    }
    getBanCredit(user) {
        return BanCommand.banCredit.has(user.id)
            ? BanCommand.banCredit.get(user.id)
            : BanCommand.BAN_CREDIT_MAX_AMOUNT;
    }
    useBanCredit(user) {
        return BanCommand.banCredit.has(user.id)
            ? BanCommand.banCredit.set(user.id, BanCommand.banCredit.get(user.id) - 1)
            : BanCommand.banCredit.set(user.id, BanCommand.BAN_CREDIT_MAX_AMOUNT - 1);
    }
    execute(_channel, _user, _args, event, repl) {
        // TODO check if user has the permissions
        if (!event.message.mentions.users.size) {
            repl('Must mention a user!', 'bad', 'See, I cannot ban everyone here, you\'ll have to tell me who to ban.');
            return false;
        }
        // const member = event.message.mentions.members.first()
        // const reason = args.join(' ').replace(member.toString(), '').replace('  ', '')
        // TODO check if user is ban immune
        // member.ban({ reason: `Mod: ${user.username} (${user.id})\nReason: ${reason}` })
        // repl(':+1:', 'success', 'The ban hammer was put to good use!')
        // TudeBot.modlog(channel.guild, 'punish', `${user.toString()} banned ${member.toString()} for reason: ${reason}`, 'high')
        return true;
    }
}
exports.default = BanCommand;
BanCommand.BAN_CREDIT_MAX_AMOUNT = 10;
BanCommand.banCredit = new Map();
BanCommand.banCreditRefiller = null;
//# sourceMappingURL=ban.js.map