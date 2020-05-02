import { User } from "discord.js";
import { TudeBot } from "../../index";
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
      discordbio: DiscordBioData,
      ksoftsi: KsoftSiData
    }
  }
}

interface DiscordBioData {
  found: boolean;
  url: string;
  verified: boolean;
  upvotes: number;
  location: string;
  gener: string;
  birthday: string;
  email: string;
  occupation: string;
  bannerImage: string;
  staff: string;
}

interface KsoftSiData {
  currentlyBanned: boolean;
  previouslyBanned: boolean;
  moderator: boolean;
  reason: boolean;
  proofImage: string;
  timestamp: Date;
}

export default class UserStalker {

  private constructor() { }

  //

  public static async getInfo(user: User): Promise<UserInfo> {
    return {
      userInstance: user,
      trustworthiness: {
        score: 1,
        sources: {
          account: {
            age: new Date().getMilliseconds() - user.createdTimestamp,
            flags: 0 // TODO
          },
          discordbio: await this.fetchDiscordBio(user.id),
          ksoftsi: await this.fetchKsoftSi(user.id)
        }
      }
    };
  }

  //

  private static async rawDiscordProfile(userid: string): Promise<any> {
    return await fetch(`https://discordapp.com/api/v7/users/${userid}`, {
      headers: { 'Authorization': `Bot ${TudeBot.token}`}
    }).then((res: Response) => res.json());
  }

  private static async fetchDiscordBio(userid: string): Promise<DiscordBioData> {
    return null;
  }

  private static async fetchKsoftSi(userid: string): Promise<KsoftSiData> {
    return null;
  }

}