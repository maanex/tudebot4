/* eslint-disable camelcase */
import axios from 'axios'


interface DiscordBioData {
  found: boolean
  url: string
  verified: boolean
  upvotes: number
  description: string
  location: string
  gender: string
  birthday: string
  email: string
  occupation: string
  bannerImage: string
  staff: string
  connections: { key: string, value: string }[]
  datapoints: number
}

interface KsoftSiData {
  currentlyBanned: boolean
  previouslyBanned: boolean
  moderator: boolean
  reason: boolean
  proofImage: string
  timestamp: Date
}

interface BotMeta {
  rpc: {
    id: string
    name: string
    icon: string
    description: string
    summary: string
    cover_image: string
    hook: boolean
    bot_public?: boolean
    bot_require_code_grant?: boolean
    terms_of_service_url?: string
    privacy_policy_url?: string
    verify_key: string
    flags: number
  },
  assets: {
    id: string
    type: number
    name: string
  }[]
}

export default class UserStalker {

  public static async fetchDiscordBio(userid: string): Promise<DiscordBioData> {
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

  public static fetchKsoftSi(_userid: string): Promise<KsoftSiData> {
    return null
  }

  public static async fetchBotMeta(botid: string): Promise<BotMeta> {
    const [ rpc, assets ] = await Promise.all([
      axios.get(`https://discord.com/api/v9/oauth2/applications/${botid}/rpc`, { validateStatus: null }),
      axios.get(`https://discord.com/api/v9/oauth2/applications/${botid}/assets`, { validateStatus: null })
    ])
    return { rpc: rpc.data, assets: assets.data }
  }

}
