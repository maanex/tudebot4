import { Message } from 'discord.js'
import * as ogs from 'open-graph-scraper'
import * as getUrls from 'get-urls'


export default class LinkAnalyzer {

  public static rawMessage(message: Message) {
    if (!message.content.includes('.')) return
    const urls = getUrls(message.content)
    for (const link of urls)
      this.analyze(link)

  }

  public static analyze(link: string) {
    console.log(`>> ${link}`)

    ogs({ url: link })
      .then((meta) => {
        console.log(meta.result)
      })
      .catch((err) => {
        console.error(err)
      })

    // TudeBot.alexaAPI.awis(new URL(link)); // TODO
  }


}
