import axios from 'axios'
import { decode } from 'html-entities'


export type WikiContent = {
  title: string
  link: string
  content: string
}

export async function parseWikiHtmlToMd(pageid: string): Promise<WikiContent> {
  const { data, status } = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageid}&format=json`)
  if (status !== 200) return null

  const item = data.parse

  const raw = item.text['*']
  const content = decode(raw)
    .replace(/<style.*?\/style>/g, '')
    .replace(/<table.*?\/table>/g, '')
    .replace(/<div.*?id="toc".*?\/div>/g, '')
    .replace(/<(?:br|tr) ?\/?>/g, '\n')
    .replace(/<h2.*?>(.+?)<\/h2>/g, '**$1**')
    .replace(/<h3.*?>(.+?)<\/h3>/g, '*$1*')
    .replace(/'''(.+?)'''/g, '**$1**')
    .replace(/^.*This article.*$/gmi, '')
    .replace(/''(.+?)''/g, '*$1*')
    .replace(/<.+?>/g, ' ')
    .replace(/\[+.+?\]+/g, '')
    .replace(/\(+.+?\)+/g, '')
    .replace(/^\n|\n$/gm, '')
    .replace(/^ +| +$/gm, '')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .replaceAll(item.title, `**${item.title}**`)
    .split('<!--')[0]
    .split('References')[0]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 4)
    .join('\n')

  return {
    title: item.title,
    content,
    link: `http://en.wikipedia.org/?curid=${item.pageid}`
  }
}
