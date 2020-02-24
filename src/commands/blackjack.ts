import { TudeBot } from "../index";
import { Message, Channel, User, MessageReaction, TextChannel } from "discord.js";
import TudeApi, { Badge, ClubUser } from "../thirdparty/tudeapi/tudeapi";
import Emojis from "../int/emojis";
import { cmesType, Command, CommandExecEvent, ReplyFunction } from "../types";


interface Card {
  number: number | 'J' | 'Q' | 'K' | 'A';
  color: 'hearts' | 'diamonds' | 'spades' | 'clubs';
}

interface Entry {
  by: User;
  clubuser: ClubUser;
  amount: number;
  cards: Card[];
  canDraw: boolean;
  choosenAction?: 'hit' | 'stand' | 'doubledown' | 'split';
  balance: number;
}


export default class BlackJackCommand extends Command {

  private readonly hit = '✅';
  private readonly stand = '⏸️';

  private readonly hearts = '<:hearts:661657523878625295>';
  private readonly diamonds = '<:diamonds:661657523820036106>';
  private readonly spades = '<:spades:661657523333496854>';
  private readonly clubs = '<:clubs:661657523756990524>';
  private readonly cvalues = {
    black: [
      '<:b2:661659488872300584>',
      '<:b3:661659488562184195>',
      '<:b4:661659488847134720>',
      '<:b5:661659488897728522>',
      '<:b6:661659488947929098>',
      '<:b7:661659488528367655>',
      '<:b8:661659488821968981>',
      '<:b9:661659488595738675>',
      '<:bJ:661659488750927902>',
      '<:bQ:661659488872562718>',
      '<:bK:661659488863911936>',
      '<:bA:661659488411058180>',
    ],
    red: [
      '<:r2:661660240168878100>',
      '<:r3:661660240198238208>',
      '<:r4:661660239757836291>',
      '<:r5:661660240160358418>',
      '<:r6:661660240231661578>',
      '<:r7:661660240235855912>',
      '<:r8:661660240093380626>',
      '<:r9:661660240382525466>',
      '<:rJ:661660239929671741>',
      '<:rQ:661660240252633105>',
      '<:rK:661660240227467264>',
      '<:rA:661660239975809085>',
    ]
  };

  private currentGame = {
    entries: [] as Entry[],
    dealer: [] as Card[],
    allowNewEntries: true,
    started: false,
    startIn: 0,
    chatMessage: null as Message,
    deck: [] as Card[]
  };
  private currentGameTimer = null;


  constructor(lang: (string) => string) {
    super(
      'blackjack',
      [ 'bj' ],
      'A sweet game of Black Jack',
      false,
      false,
      lang
    );
  }

  public execute(channel: TextChannel, user: User, args: string[], event: CommandExecEvent, repl: ReplyFunction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (args.length < 1) {
        repl('blackjack <stake>', 'bad', 'Maximum stake: 2000');
        resolve(false);
        return;
      }

      let cookies = args[0] == 'a' ? -42 : parseInt(args[0]);
      if (isNaN(cookies)) {
        repl(args[0] + ' is not a valid amount of cookies!', 'bad');
        resolve(false);
        return;
      }

      if (cookies > Math.random() * 1_000_000 + 100_000) {
        repl('That is insane!', 'bad', `I've never been provoked that much, LEAVE THIS CASINO RIGHT NOW!`);
        resolve(false);
        return;
      }

      if (cookies > 2000) {
        repl(args[0] + ' cookies is over the casino\'s maximum stake of 2000!', 'bad');
        resolve(false);
        return;
      }

      TudeApi.clubUserByDiscordId(user.id, user).then(u => {
        if (!u || u.error) {
          repl('Couldn\'t fetch your userdata!', 'bad', 'That\'s not cool.');
          resolve(false);
          return;
        }
        if (cookies > u.cookies) {
          if (Math.random() < .05) {
            // @ts-ignore
            repl(`${hidethepain} ${cookies} is more than you have`, 'bad', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png', banner: 'https://cdn.discordapp.com/emojis/655169782806609921.png' });
          } else {
            // @ts-ignore
            repl(`${cookies} is more than you have`, 'bad', `You have ${u.cookies} cookies!`, { image: 'https://cdn.discordapp.com/emojis/655169782806609921.png?size=32' });
          }

          resolve(false);
          return;
        }
        if (cookies == -42) {
          if (u.cookies == 0) {
            repl('You don\'t have any money to play with!', 'bad');
            resolve(false);
            return;
          }
          cookies = Math.min(2000, u.cookies);
        }
        if (cookies <= 0) {
          repl('You cannot bet on 0 or less cookies!', 'bad');
          resolve(false);
          return;
        }

        if (this.currentGame.started) {
          if (!this.currentGame.allowNewEntries) {
            repl('Please wait a moment, a game is still in progress!', 'bad');
            resolve(false);
            return;
          }
          for (let entry of this.currentGame.entries) {
            if (entry.by.id == user.id) {
              repl('You have already placed your bet on this game!', 'bad');
              resolve(false);
              return;
            }
          }
          u.cookies -= cookies;
          TudeApi.updateClubUser(u);
          this.currentGame.entries.push({
            by: user,
            clubuser: u,
            amount: cookies,
            cards: [],
            canDraw: true,
            balance: 0
          });
          // this.currentGame.startIn = 5;
          // if (TudeBot.m.commands.getActiveInCommandsChannel().length > this.currentGame.entries.length)
          // this.currentGame.startIn = 10;
          this.currentGame.startIn = 5;
          resolve(true);
        } else {
          this.currentGame.started = true;
          u.cookies -= cookies;
          TudeApi.updateClubUser(u);
          this.currentGame.entries.push({
            by: user,
            clubuser: u,
            amount: cookies,
            cards: [],
            canDraw: true,
            balance: 0
          });
          // this.currentGame.startIn = 3;
          // if (TudeBot.m.commands.getActiveInCommandsChannel().length > this.currentGame.entries.length)
          this.currentGame.startIn = 10;
          resolve(true);
          channel.send({
            embed: {
              color: 0x2f3136,
              title: 'Black Jack',
              description: 'Preparing...'
            }
          }).then(mes => this.currentGame.chatMessage = mes as Message).catch();
          this.currentGameTimer = setInterval(() => {
            if (this.currentGame.startIn == 10 || this.currentGame.startIn == 5 || this.currentGame.startIn <= 2) {
              if (this.currentGame.chatMessage)
                this.currentGame.chatMessage.edit('', {
                  embed: {
                    color: 0x2f3136,
                    title: 'Black Jack',
                    description: 'Starting in ' + this.currentGame.startIn + '```js\n'
                      + this.currentGame.entries.map(b => `${b.by.username}: ${b.amount}c`).join('\n')
                      + '```',
                  }
                });
            }
            if (this.currentGame.startIn-- <= 0) {
              this.currentGame.allowNewEntries = false;
              clearInterval(this.currentGameTimer);
              this.startGame();
            }
          }, 1000);
        }

      }).catch(err => {
        console.error(err);
        repl('An error occured!', 'error');
      });
    });
  }

  init() {
    TudeBot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
      if (!this.currentGame) return;
      if (user.bot) return;
      if (!this.currentGame || !this.currentGame.chatMessage) return;
      if (reaction.message.id !== this.currentGame.chatMessage.id) return;
      let playing: Entry = undefined;
      for (let e of this.currentGame.entries)
        if (e.by.id === user.id) {
          playing = e
          break;
        }
      if (!playing) return;
      switch (reaction.emoji.name) {
        case this.hit:
          playing.choosenAction = 'hit';
          break;
        case this.stand:
          playing.choosenAction = 'stand';
          break;

      }
      for (let e of this.currentGame.entries)
        if (e.canDraw && !e.choosenAction) return;
      this.gameloop();
    });
  }

  private startGame() {
    if (!this.currentGame.chatMessage) {
      this.resetGame();
      return;
    }

    for (let type of ['hearts', 'diamonds', 'spades', 'clubs'])
      for (let value of [2, 3, 4, 5, 6, 7, 8, 9, 'J', 'Q', 'K', 'A'])
        for (let i = 0; i < 6; i++)
          // @ts-ignore
          this.currentGame.deck.push({ color: type, number: value });

    this.currentGame.dealer.push(this.currentGame.deck.splice(Math.floor(Math.random() * this.currentGame.deck.length), 1)[0]);

    for (let entry of this.currentGame.entries) {
      entry.cards.push(this.currentGame.deck.splice(Math.floor(Math.random() * this.currentGame.deck.length), 1)[0]);
      entry.cards.push(this.currentGame.deck.splice(Math.floor(Math.random() * this.currentGame.deck.length), 1)[0]);
      if (Math.abs(this.countValue(entry.cards)) == 21)
        entry.canDraw = false;
    }

    this.gameloop(true);
  }

  private gameloopTimeoutTimer: NodeJS.Timeout = undefined;
  private gameloop(firstRound = false) {
    if (this.gameloopTimeoutTimer)
      clearTimeout(this.gameloopTimeoutTimer);
    this.gameloopTimeoutTimer = setTimeout(() => this.gameloop(), 15_000);

    if (firstRound) {
      for (let e of this.currentGame.entries)
        if (e.canDraw) {
          this.updateMessage();
          return;
        }
      this.gameOver();
      return;
    }

    for (let e of this.currentGame.entries)
      e.choosenAction = e.choosenAction || 'stand';
    for (let e of this.currentGame.entries) {
      if (!e.canDraw) continue;
      switch (e.choosenAction) {
        case 'hit':
          e.cards.push(this.currentGame.deck.splice(Math.floor(Math.random() * this.currentGame.deck.length), 1)[0]);
          let value = this.countValue(e.cards);
          if (Math.abs(value) >= 21) e.canDraw = false;
          break;

        case 'stand':
          e.canDraw = false;
          break;
      }
    }
    let done = true;
    for (let e of this.currentGame.entries) {
      e.choosenAction = undefined;
      if (e.canDraw)
        done = false;
    }

    if (!done) this.updateMessage();
    else this.gameOver();
  }

  private async gameOver() {
    if (this.gameloopTimeoutTimer)
      clearTimeout(this.gameloopTimeoutTimer);

    do this.currentGame.dealer.push(this.currentGame.deck.splice(Math.floor(Math.random() * this.currentGame.deck.length), 1)[0]);
    while (this.countValue(this.currentGame.dealer) < 17);

    let dealerVal = Math.abs(this.countValue(this.currentGame.dealer));
    for (let e of this.currentGame.entries) {
      let val = Math.abs(this.countValue(e.cards));
      if (val > 21) e.balance = -e.amount;
      else if (val == 21 && e.cards.length == 2) e.balance = e.amount * 3 / 2;
      else if (dealerVal > 21) e.balance = e.amount
      else if (val > dealerVal) e.balance = e.amount;
      else if (val == dealerVal) e.balance = 0;
      else if (val < dealerVal) e.balance = -e.amount;

      e.clubuser.cookies += Math.ceil(e.amount + e.balance);
      if ((e.amount + e.balance) != 0) TudeApi.updateClubUser(e.clubuser);
    }

    await this.updateMessage(true, false, true);
    this.resetGame();
  }

  private countValue(cards: Card[]): number {
    // @ts-ignore
    // return entry.cards.map(c => c.number).stack();
    let num = 0;
    let aces = 0;
    cards.map(c => c.number).forEach(n => {
      if (typeof n == 'string') {
        if (n == 'A') aces++;
        else num += 10;
      } else num += n as number;
    });
    let soft = false;
    while (aces > 0) {
      if (aces * 11 + num > 21) num += 1;
      else {
        num += 11;
        soft = true;
      }
      aces--;
    }
    return soft ? -num : num;
  }

  private async updateMessage(removeEmojis = true, addEmojis = true, end = false) {
    if (!this.currentGame.chatMessage) return;
    if (removeEmojis) {
      if (addEmojis
        && this.currentGame.chatMessage.reactions.get(this.hit)
        && this.currentGame.chatMessage.reactions.get(this.hit)
        && this.currentGame.chatMessage.reactions.get(this.hit).count <= 2
        && this.currentGame.chatMessage.reactions.get(this.hit).count <= 2) {
        for (let u of this.currentGame.chatMessage.reactions.get(this.stand).users.array())
          if (!u.bot)
            await this.currentGame.chatMessage.reactions.get(this.stand).remove(u.id);
        for (let u of this.currentGame.chatMessage.reactions.get(this.hit).users.array())
          if (!u.bot)
            await this.currentGame.chatMessage.reactions.get(this.hit).remove(u.id);
        // this.currentGame.chatMessage.reactions.get(hit).users.array().filter(u => !u.bot).forEach(this.currentGame.chatMessage.reactions.get(hit).remove);
        //  this.currentGame.chatMessage.reactions.get(stand).users.filter(u => !u.bot).forEach(this.currentGame.chatMessage.reactions.get(stand).remove);
      } else {
        await this.currentGame.chatMessage.clearReactions();
      }
      if (addEmojis) {
        let mes = this.currentGame.chatMessage;
        this.currentGame.chatMessage.react(this.hit).then(() => mes.react(this.stand)).catch();
      }
    }

    this.currentGame.chatMessage.edit('', {
      embed: {
        color: 0x2f3136,
        title: 'Black Jack',
        description: (end ? 'Game Over' : `${this.hit} hit • ${this.stand} stand`) + `\n${Emojis.BIG_SPACE}`,
        fields: this.embedFields(end)
      }
    });
  }

  private resetGame() {
    this.currentGame = {
      entries: [],
      allowNewEntries: true,
      started: false,
      startIn: 0,
      chatMessage: null as Message,
      deck: [] as Card[],
      dealer: []
    }
  }

  private embedFields(end: boolean) {
    let dealerVal: string | number = this.countValue(this.currentGame.dealer);
    if (dealerVal == -21 && this.currentGame.dealer.length == 2) dealerVal = 'BLACK JACK';
    if (dealerVal > 21) dealerVal = 'BURST ' + dealerVal;
    if (dealerVal == 21 && this.currentGame.dealer.length == 2) dealerVal = 'BLACK JACK';
    if (typeof dealerVal == 'number' && dealerVal < 0) dealerVal *= -1;
    // @ts-ignore
    let len = this.currentGame.entries.map(e => e.by.username.length).iterate((e, curr) => { curr > (e || 0) ? curr : (e || 0) }) + 2;
    let out = this.currentGame.entries
      .map(e => {
        let yourVal: string | number = this.countValue(e.cards);
        if (yourVal == -21 && e.cards.length == 2) yourVal = 'BLACK JACK';
        if (yourVal < 0) yourVal = 'Soft' + -yourVal;
        if (yourVal > 21) yourVal = 'BURST ' + yourVal;
        if (typeof yourVal == 'number' && yourVal < 0) yourVal *= -1;
        // return `\`${(' '.repeat(len) + e.by.username).substring(-len)}:\` **${yourVal}** ${e.cards.map(cardToEmoji).join(' ') + (e.canDraw ? '' : ' **/**')}`;
        let endtext = '';
        if (end) {
          endtext += '\n';
          if (e.balance == 0) endtext += '**STAND OFF**';
          else if (e.balance < 0) endtext += '**LOOSE**';
          else if (e.balance > 0) endtext += '**WIN**';
          endtext += Emojis.BIG_SPACE;
          endtext += (e.balance < 0 ? '' : '+') + e.balance + 'c • ' + e.clubuser.cookies + 'c total';
        }
        return {
          name: e.by.username,
          value: `**${yourVal}** ${e.cards.map(c => this.cardToEmoji(c)).join(' ') + (e.canDraw ? '' : ' **/**') + endtext}`
        }
      })
    return [
      {
        name: '`  Dealer  `',
        value: `**${dealerVal}** ${this.currentGame.dealer.map(c => this.cardToEmoji(c)).join(' ')}`
      }, ...out
    ];
  }

  private cardToEmoji(card: Card): string {
    let type = (card.color == 'hearts' || card.color == 'diamonds') ? 'red' : 'black';
    let typeEm = { hearts: this.hearts, diamonds: this.diamonds, spades: this.spades, clubs: this.clubs }[card.color];
    let num = (typeof card.number == 'number') ? (card.number - 2) : { J: 8, Q: 9, K: 10, A: 11 }[card.number];
    return typeEm + this.cvalues[type][num];
  }

}
