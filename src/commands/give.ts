import { TudeBot } from "../index";
import { Message, Channel, User, TextChannel } from "discord.js";
import TudeApi, { Badge } from "../thirdparty/tudeapi/tudeapi";
import ParseArgs from "../util/parseArgs";
import CommandsModule from "../modules/commands";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


export default class GiveCommand extends Command {

  constructor(lang: (string) => string) {
    super(
      'give',
      [ 'g',
        'send',
        'trade',
        'transaction',
        'transcribe',
        'transfer',
        'yowtfjustgivethisdudewhatheneedsboi',
        'wtfevenisthisbullshietherelikeforfookssakewhyaretheresoweirdcommandaliaseslikethisonewhyyyyy' ],
      'Transfer items or cookies to other players',
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let cmdl = ParseArgs.parse(args);
      TudeApi.clubUserByDiscordId(user.id, user)
        .then(u => {
          if (!u || u.error) {
            repl('Couldn\'t fetch your userdata!', 'message', 'That\'s not cool.');
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
            repl('Nah he no wants ya garbage, boy!', 'bad', `aka ${otherPerson.username} is a bot and they can't recieve items`);
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

          let force = cmdl.f || cmdl.force;

          let swap = !(args[1].toLowerCase() == 'a' || args[1].toLowerCase() == 'all' || !isNaN(parseInt(args[1])));

          let amount = 1;
          if (!swap || args.length > 2) {
            amount = parseInt(args[swap ? 2 : 1]);
            if (args[swap ? 2 : 1].toLowerCase() == 'a' || args[swap ? 2 : 1].toLowerCase() == 'all') amount = -42;
            else if (!force && (!amount || isNaN(amount) || amount <= 0)) {
              repl(`${args[swap ? 2 : 1]} is not a valid amount`, 'bad');
              resolve(false);
              return;
            }
          }

          let type = 'cookie';
          let dispName = 'cookies';
          if (args.length > 2 || swap) {
            let name = args[swap ? 1 : 2];
            let item = TudeApi.items.find(i => i.id == name.toLowerCase());
            dispName = item.name;
            if (!force) {
              let iitem = u.inventory.get(name.toLowerCase());
              if (!item && iitem) item = TudeApi.items.find(i => i.id == iitem.id);
              if (!item) {
                if (swap) repl(`${args[1]} is an invalid amount of cookies.`, 'bad');
                else repl(`Item ${args[1]} not found!`, 'bad');
                resolve(false);
                return;
              }
              if (!item.tradeable) {
                repl(`This item is not tradeable!`, 'bad');
                resolve(false);
                return;
              }
              if (!iitem || !iitem.amount) {
                if (item.expanded) repl(`You have to specify which one, e.g. \`${item.id}1\`!`, 'bad');
                else repl(`You don't have any ${item.name}!`, 'bad');
                resolve(false);
                return;
              }
              if (amount == -42) amount = iitem.amount;
              if (iitem.amount < amount) {
                repl(`You only have ${iitem.amount} ${item.name}${iitem.amount == 1 ? '' : 's'}!`, 'bad');
                resolve(false);
                return;
              }
            }
            type = name;
          } else {
            if (amount == -42) amount = u.cookies;
            if (amount > u.cookies) {
              repl(`You only have ${u.cookies} cookie${u.cookies == 1 ? '' : 's'}!`, 'bad');
              resolve(false);
              return;
            }
            if (amount == 1) dispName = 'cookie'
          }

          TudeApi.clubUserByDiscordId(otherPerson.id, otherPerson).then(rec => {
            TudeApi.performClubUserAction(u, { id: 'transaction', amount: amount, type: type, reciever: rec.id }).then(o => {
              channel.send({
                embed: {
                  color: 0x4DC88A,
                  title: `Transaction completed.`,
                  description: `${otherPerson.username} recieved **${amount} ${dispName}** from ${user.username}.`,
                  footer: { text: `@${user.username}` }
                }
              });
              if (!TudeBot.getModule<CommandsModule>('commands').getActiveInCommandsChannel().includes(otherPerson.id)) {
                otherPerson.send({
                  embed: {
                    color: 0x4DC88A,
                    title: `UwU a gift`,
                    description: `${user.username} sent you **${amount} ${dispName}**. Time to party.`,
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
        })
    });
  }

}
