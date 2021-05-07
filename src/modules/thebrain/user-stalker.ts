import axios from 'axios'
import { User } from 'discord.js'
import fetch, { Response } from 'node-fetch'
import { TudeBot } from '../../index'


interface DiscordBioData {
  found: boolean;
  url: string;
  verified: boolean;
  upvotes: number;
  description: string;
  location: string;
  gender: string;
  birthday: string;
  email: string;
  occupation: string;
  bannerImage: string;
  staff: string;
  connections: { key: string, value: string }[];
  datapoints: number;
}

interface KsoftSiData {
  currentlyBanned: boolean;
  previouslyBanned: boolean;
  moderator: boolean;
  reason: boolean;
  proofImage: string;
  timestamp: Date;
}
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
export default class UserStalker {

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
    }
  }

  //

  private static async rawDiscordProfile(userid: string): Promise<any> {
    return await fetch(`https://discordapp.com/api/v7/users/${userid}`, {
      headers: { Authorization: `Bot ${TudeBot.token}` }
    }).then((res: Response) => res.json())
  }

  private static async fetchDiscordBio(userid: string): Promise<DiscordBioData> {
    try {
      const { data } = await axios.get(`https://api.discord.bio/user/details/${userid}`)
      const user = data.payload.user
      const connections = []
      for (const name in user.userConnections)
        connections.push({ key: name, value: user.userConnections[name] })
      for (const conn of (user.discordConnections || []))
        connections.push({ key: conn.connection_type, value: conn.name })
      const out: DiscordBioData = {
        found: true,
        url: `https://dsc.bio/${user.details.slug || userid}`,
        verified: user.details.verified === 1,
        upvotes: user.details.likes,
        description: user.details.description,
        location: user.details.location,
        gender: user.details.gender,
        birthday: user.details.birthday,
        email: user.details.email,
        occupation: user.details.occupation,
        bannerImage: user.details.bannerImage,
        staff: user.details.staff,
        connections,
        datapoints: connections.length
      }
      for (const key of [ 'description', 'location', 'gender', 'birthday', 'email', 'occupation' ])
        if (out[key]) out.datapoints++
      return out
    } catch (ex) {
      console.log(ex)
      return null
    }
  }

  private static fetchKsoftSi(_userid: string): Promise<KsoftSiData> {
    return null
  }

}
