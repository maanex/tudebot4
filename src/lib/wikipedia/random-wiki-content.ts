import axios from 'axios'
import { parseWikiHtmlToMd, WikiContent } from './parse-wiki-html-to-md'


export default async function randomWikiContent(): Promise<WikiContent> {
  const { data, status } = await axios.get('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=revisions&rvprop=content&grnlimit=1')
  if (status !== 200) return null

  const item = Object.values(data.query.pages)[0] as any
  const id = item.pageid

  return parseWikiHtmlToMd(id)
}
