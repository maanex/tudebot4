import { ReplyableComponentInteraction } from 'cordo'
import { TudeBot } from '../../../..'


const ITEMS_PER_PAGE = 3

export default function (i: ReplyableComponentInteraction) {
  const page = parseInt(i.params.page + '')
  const all = [ ...TudeBot.modules.entries() ]
  const guild = TudeBot.guildSettings.get(i.guild_id)?.modules
  if (!guild) return i.ack()
  const filtered = all.filter(([ id ]) => !guild[id])
  const modules = filtered.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
  const maxPage = ~~(filtered.length / ITEMS_PER_PAGE)

  i.state('settings_modules_store_page', page, maxPage, modules)
}
