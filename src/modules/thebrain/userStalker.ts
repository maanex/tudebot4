import { User } from "discord.js";
import { TudeBot } from "index";
import fetch, { Response } from "node-fetch";


export interface UserInfo {
  userInstance: User;
  trustworthiness: {
    score: number;
    sources: {
      account: {
        age: number;
        flags: number;
      },
      discordbio: {
        found: boolean;
        verified: boolean;
        upvotes: number;
        location: string;
        gener: string;
        birthday: string;
        email: string;
        occupation: string;
        bannerImage: string;
        staff: string;
      },
      ksoftsi: {
        currentlyBanned: boolean;
        previouslyBanned: boolean;
        moderator: boolean;
        reason: boolean;
        proofImage: string;
        timestamp: Date;
      }
    }
  }
}

export default class UserStalker {

  private constructor() { }

  //

  public static getInfo(user: User): UserInfo {
    return null;
  }

  //

  private static async rawDiscordProfile(userid: string): Promise<any> {
    return await fetch(`https://discordapp.com/api/v7/users/${userid}`, {
      headers: { 'Authorization': `Bot ${TudeBot.token}`}
    }).then((res: Response) => res.json());
  }

}