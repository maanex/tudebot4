import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";
import ParseArgs from "../util/parseArgs";
import CommandsModule from "../modules/commands";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";
import { ItemList } from "../content/itemlist";
import { Item } from "thirdparty/tudeapi/item";


export default class GiveCommand extends Command {

  constructor() {
    super({
      name: 'give',
      aliases: [ 'g', 'send', 'trade', 'transaction', 'transcribe', 'transfer', 'yowtfjustgivethisdudewhatheneedsboi', 'wtfevenisthisbullshietherelikeforfookssakewhyaretheresoweirdcommandaliaseslikethisonewhyyyyy' ],
      description: 'Transfer items or cookies to other players',
      cooldown: 5,
      groups: [ 'club' ],
    });
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cmdl = ParseArgs.parse(args);
      TudeApi.clubUserByDiscordId(user.id, user)
        .then(u => {
          if (!u || u.error) {
            repl('Couldn\'t fetch your userdata!', 'message', 'That\'s not cool.');
            resolve(false);
            return;
          }
          if (u.level < 3) {
            repl(`I'm sorry, but you're not allowed to do that!`, 'bad', 'You need to be at least level 3 to trade with other players!');
            resolve(false);
            return;
          }

          if (args.length < 2) {
            repl('give <@someone> <amount> [itemname]', 'bad', 'Don\'t provide an item name in order to send them your cookies');
            resolve(false);
            return;
          }

          let otherPerson = event.message.mentions.users.first();
          if (!otherPerson) {
            repl(`Who tf is ${args[0]}?`, 'bad');
            resolve(false);
            return;
          }
          if (otherPerson.bot) {
            repl(`${otherPerson.username} doesn't want your stuff!`, 'bad', `In other words: they're a bot and cannot recieve items.`);
            resolve(false);
            return;
          }
          if (otherPerson.id === user.id) {
            channel.send({
              embed: {
                color: 0x2f3136,
                image: { url: 'https://cdn.discordapp.com/attachments/655354019631333397/669183258679967744/34yx3j.png' },
                footer: { text: `@${user.username}` }
              }
            });
            resolve(false);
            return;
          }
          TudeApi.clubUserByDiscordId(otherPerson.id, otherPerson).then(rec => {
            if (rec.level < 3) {
              repl(`Oh no, you cannot trade with ${otherPerson.username}!`, 'bad', 'They need to be at least level 3 in order to recieve items!');
              resolve(false);
              return;
            }
            args.splice(0, 1);

            const force = cmdl.f || cmdl.force;

            let amountSet = false;
            let typeSet = false;
            let amount = 1;
            let type = 'cookie';
            let dispName = 'cookie';
            let dispNamePl = 'cookies';
            let item: Item = null;

            for (let arg of args) {
              if (arg.toLowerCase() == 'a' || arg.toLowerCase() == 'all') {
                amount = -42;
                amountSet = true;
              } else if (!isNaN(parseInt(arg))) {
                amount = parseInt(arg);
                amountSet = true;
              } else {
                item = u.inventory.get(arg.toLowerCase());
                
                if (!item) {
                  const listItem = ItemList.find(i => i.id == arg.toLowerCase());
                  if (!listItem) {
                    repl(`Item ${arg} not found!`, 'bad');
                    resolve(false);
                    return;
                  } else {
                    repl(`You don't have any ${TudeApi.clubLang['itempl_'+listItem.id]}!`, 'bad');
                    resolve(false);
                    return;
                  }
                }
                
                const itemPrefab = ItemList.find(i => i.id == item.prefab.id);
                dispName = TudeApi.clubLang['item_'+itemPrefab.id];
                dispNamePl = TudeApi.clubLang['itempl_'+itemPrefab.id];
                type = arg.toLowerCase();
                typeSet = true;
              }
            }

            if (args.length > 1) {
              if (!amountSet) {
                repl(`${args[1]} is not a valid amount!`, 'bad');
                resolve(false);
                return;
              }
              if (!typeSet) {
                repl(`Item ${args[1]} not found!`, 'bad');
                resolve(false);
                return;
              }
            }

            if (item) {
              if (!item.prefab.tradeable) {
                repl(`${dispNamePl} are unfortunately not tradeable!`, 'bad');
                resolve(false);
                return;
              }
            }

            if (amount == -42) {
              if (item) {
                amount = item.amount;
              } else {
                amount = u.cookies;
              }

              if (amount <= 0) {
                repl(`You don't have any ${dispNamePl}!`, 'bad');
                resolve(false);
                return;
              }
            }

            if (amount <= 0) {
              repl(`You cannot send 0 or less ${dispNamePl}!`, 'bad');
              resolve(false);
              return;
            }

            const haveAmount = (item ? item.amount : u.cookies);
            if (amount > haveAmount) {
              repl(`You cannot give away ${amount} ${dispNamePl}! You only have ${haveAmount}!`, 'bad');
              resolve(false);
              return;
            }

            TudeApi.performClubUserAction(u, { id: 'transaction', amount: amount, type: type, reciever: rec.id }).then(o => {
              channel.send({
                embed: {
                  color: 0x4DC88A,
                  title: `Transaction completed.`,
                  description: `${otherPerson.username} recieved **${amount} ${amount == 1 ? dispName : dispNamePl}** from ${user.username}.`,
                  footer: { text: `@${user.username}` }
                }
              });
              if (!TudeBot.getModule<CommandsModule>('commands').getActiveInCommandsChannel().includes(otherPerson.id)) {
                otherPerson.send({
                  embed: {
                    color: 0x4DC88A,
                    title: this.lang('give_dm_title'),
                    description: `${user.username} sent you **${amount} ${amount == 1 ? dispName : dispNamePl}**. ${this.lang('give_dm_catchline')}`,
                    footer: { text: `I sent you this via DM because I thought you might not see it otherwise` }
                  }
                });
              }
              resolve(true);
            }).catch(o => {
              if (o && o.message) repl(o.message, 'bad');
              else repl('An error occured!', 'bad');
              resolve(false);
            });
          }).catch(err => {
            repl('An error occured!', 'bad');
            resolve(false);
          })
        })
        .catch(err => {
          repl('An error occured!', 'bad');
          console.error(err);
          resolve(false);
        });
    });
  }

}
