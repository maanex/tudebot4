/* eslint-disable no-useless-constructor */
import { GuildMember } from 'discord.js'
import UserStalker from './user-stalker'


export default class BotProfile {

  public static async getBotMeta(member: GuildMember): Promise<[ number, string ]> {
    const data = await UserStalker.fetchBotMeta(member.id)

    const visibility = data.rpc.bot_public ? 'Public bot' : 'Private bot'
    const codegrant = data.rpc.bot_require_code_grant ? 'Code grant required' : 'No code grant'
    const policiesRaw = [
      data.rpc.privacy_policy_url ? `[Privacy Policy](${data.rpc.privacy_policy_url})` : '',
      data.rpc.terms_of_service_url ? `[Terms Of Service](${data.rpc.terms_of_service_url})` : ''
    ].join(', ')
    const policiesList = policiesRaw ? `Policies: ${policiesRaw}\n` : ''
    const assets = !data.assets?.length
      ? 'No assets found'
      : 'Assets: ' + data.assets.slice(0, 7).map(a => `[${a.name}](https://cdn.discordapp.com/app-assets/${member.id}/${a.id}.webp?size=4096)`).join(', ') + (data.assets.length > 7 ? `, [+${data.assets.length - 7} more](https://discord.com/api/v9/oauth2/applications/${member.id}/assets)` : '')

    return [
      undefined,
      `${visibility}, ${codegrant}\n${policiesList}${assets}`
    ]
  }

}
