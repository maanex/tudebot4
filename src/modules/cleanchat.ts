import { TudeBot } from "../index";
import { GuildMember, Message, Emoji, TextChannel, Channel, Attachment, RichEmbed } from "discord.js";
import { Module } from "../types";
import generateInviteLinkMeme from "../functions/generateInviteLinkMeme";
import Emojis from "../int/emojis";


export default class AutoSupportModule extends Module {
  
  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Auto Support', 'public', conf, data, guilds, lang);
  }

  public onEnable(): void {
    TudeBot.on('message', (mes: Message) => {
      if (!this.isMessageEventValid(mes)) return;
      // if (mes.member.highestRole.comparePositionTo(mes.guild.me.highestRole) > 0) return; // TODO REENABLE, DISABLED FOR EASIER TESTING

      if (this.checkInviteLinks(mes)) return;
    });
  }

  public onBotReady(): void {
  }

  public onDisable(): void {
  }

  public repl(message: Message, title: string, description: string) {
    (message.channel as TextChannel).send({
      embed: {
        color: 0x2f3136,
        title: title,
        description: description,
        footer: { text: 'CleanChat • Auto Moderator' }
      }
    })
  }

  /* */

  private inviteResponseStatus = 0;

  public checkInviteLinks(mes: Message): boolean {
    if (!/discord.gg\/.+/i.test(mes.content)) return false;

    if (this.inviteResponseStatus == 0) {
      generateInviteLinkMeme(mes.author.username)
        .then(img => {
          const file = new Attachment(img, `i-do-not-like-you-${mes.author.username.toLowerCase()}.png`);
          const embed = new RichEmbed()
            .attachFile(file)
            .setColor(0x2f3136)
            .setImage(`attachment://i-do-not-like-you-${mes.author.username.toLowerCase()}.png`);
          mes.channel.send(embed);
        })
        .catch(err => {
          console.error(err);
          this.repl(mes, 'No invite links!', 'Please do not advertise here, thanks!');
        });
    } else if (this.inviteResponseStatus == 1) {
      this.repl(mes, 'I was not kidding!', 'No advertising here. And no Discord invite links!');
    } else if (this.inviteResponseStatus == 5) {
      this.repl(mes, 'See, I tried to stay calm but enough is enough!', 'Now would you please shut the fu*** up and stop posting invite links?');
    }

    this.inviteResponseStatus++;
    setTimeout(i => i.inviteResponoseStatus--, 5*60*1000, this);

    mes.delete();
    return true;
  }
}